/**
 * Fetches initial data and hides the loader once data is loaded.
 * @returns {Promise<void>} A promise that resolves when initial data is fetched.
 */
async function fetchInitialData() {
    showLoader();
    try {
        await fetchTasks();
    } catch (error) {
        console.error('Error fetching initial data:', error);
    } finally {
        
    }
}

/**
 * Displays the loader element by setting its display style to 'block' if it exists in the DOM.
 *
 * @function showLoader
 * @returns {void}
 */
function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'block';
    }
}

/**
 * Fetches tasks from the server and stores them in a global object.
 * @returns {Promise<void>} A promise that resolves when tasks are fetched and processed.
 */
async function fetchTasks() {

    try {
        let apiUrl = await importConfig();
        let fetchUrl = `${apiUrl}/api/tasks`;
        const response = await fetchToBackend(fetchUrl, 'GET');
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        const result = await response.json();
        tasksGlobal = {};
        Object.keys(result.tasks).forEach(firebaseTaskId => {
            const task = result.tasks[firebaseTaskId];
            
            if (task.assigneeId) {
                const assigneeResponse =  fetchToBackend(`${apiUrl}/api/accounts/${task.assigneeId}`, 'GET');
                const assignee =  assigneeResponse.json();
                task.assignee = `${assignee.firstName} ${assignee.lastName}`;
                task.profileColor = assignee.color;
            }
            tasksGlobal[firebaseTaskId] = task;
        });
        await displayTasks(tasksGlobal);
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

/**
 * Function for opening a task and displaying the task details as popup.
 * @param {string} firebaseTaskId - Specific ID of the task you want to open.
 * @returns {void}
 */
let tasksGlobal = {};
async function openTask(firebaseTaskId) {
    const task = tasksGlobal[firebaseTaskId];
    if (!task) {
        console.error('Task not found!', firebaseTaskId);
        return;
    }

    fillPopupFields(task);
    await fillAssignees(task.assigneeNames);
    setHiddenInput(firebaseTaskId);
    setTaskOptions(firebaseTaskId);
    editingSubtasks = task.subTasks || [];
    updateSubtaskList(firebaseTaskId);
    showPopup();
}

/**
 * Asynchronously fills the assignees section of the popup with formatted assignee names.
 *
 * @async
 * @function fillAssignees
 * @param {string[]|string} assigneeNames - A list or a string of assignee names to be displayed.
 * @returns {Promise<void>} Resolves when the assignee names are formatted and set in the popup.
 */
async function fillAssignees(assigneeNames) {
    const getById = id => document.getElementById(id);
    getById('popupAssignedTo').innerHTML = await formatAssigneeNames(assigneeNames);
}

/**
 * Sets the hidden input field with the task ID for a Firebase task.
 *
 * @function setHiddenInput
 * @param {string} firebaseTaskId - The task ID of the Firebase task.
 * @returns {void}
 */
function setHiddenInput(firebaseTaskId) {
    const getById = id => document.getElementById(id);
    let hiddenInput = getById('popupTaskId');
    if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = 'popupTaskId';
        getById('taskPopup').appendChild(hiddenInput);
    }
    hiddenInput.value = firebaseTaskId;
}

/**
 * Populates the task options section with delete and edit options for a specific task.
 *
 * @function setTaskOptions
 * @param {string} firebaseTaskId - The task ID of the Firebase task.
 * @returns {void}
 */
function setTaskOptions(firebaseTaskId) {
    const getById = id => document.getElementById(id);
    getById('taskOptions').innerHTML = `
        <div id="taskDelete" onclick="showDeletePopup('${firebaseTaskId}')">
            <img src="./assets/img/delete.png" alt="delete task"> Delete
        </div>
        <div id="editTask" onclick="editTask('${firebaseTaskId}')">
            <img src="./assets/img/edit.png" alt="edit task"> Edit
        </div>
    `;
}

/**
 * Displays the task popup and its overlay.
 *
 * @function showPopup
 * @returns {void}
 */
function showPopup() {
    const getById = id => document.getElementById(id);
    ['taskPopup', 'overlay'].forEach(id => getById(id).style.display = 'block');
}

/**
 * Fills the popup fields with task details such as title, description, due date, category, and priority.
 *
 * @function fillPopupFields
 * @param {Object} task - The task details to fill in the popup.
 * @param {string} task.title - The title of the task.
 * @param {string} task.description - The description of the task.
 * @param {string} task.dueDate - The due date of the task.
 * @param {string} task.category - The category of the task (e.g., "technicalTask", "userStory").
 * @param {string} task.priority - The priority of the task.
 * @returns {void}
 */
function fillPopupFields({ title, description, dueDate, category, priority }) {
    const getById = id => document.getElementById(id);
    getById('popupTitle').textContent = title;
    getById('popupDescription').textContent = description;
    getById('popupDueDate').textContent = dueDate;

    const categoryMap = { technicalTask: "Technical Task", userStory: "User Story" };
    const popupCategoryDiv = getById('popupCategory');
    popupCategoryDiv.textContent = categoryMap[category] || category;
    popupCategoryDiv.className = category;

    const priorityUrl = getPriorityUrl(priority);
    getById('popupPrio').innerHTML = `${priority} <img src="${priorityUrl}">`;
}

/**
 * Asynchronously formats the assignee names into HTML format to be displayed.
 *
 * @async
 * @function formatAssigneeNames
 * @param {string[]|string} assigneeNames - A list or a string of assignee names to be formatted.
 * @returns {Promise<string>} A promise that resolves to a string of HTML containing the formatted assignees.
 */
async function formatAssigneeNames(assigneeNames) {
    if (!assigneeNames) return 'No one assigned';

    if (typeof assigneeNames !== 'string') {
        if (Array.isArray(assigneeNames)) {
            assigneeNames = assigneeNames.join(', ');
        } else {
            return 'No one assigned';
        }
    }

    const assigneePromises = assigneeNames.split(',').map(async name => {
        let trimmedName = name.trim();
        let parts = trimmedName.split(' ');

        let firstName = parts[0];
        let lastName = parts.slice(1).join(' ');

        let initials = parts.map(part => part[0]).join('');
        let fullName = parts.join(' ');
        let profileColor = await getProfileColor(firstName, lastName);

        return `
        <div class="d-flex align-center">
            <div class="initials" style="background-color:${profileColor};">
            ${initials}
            </div>
            ${fullName}
        </div>
        `;
    });

    const assigneeHtmlArray = await Promise.all(assigneePromises);
    return assigneeHtmlArray.join('').replace(/,/g, '');
}

/**
 * Deletes a task from the backend.
 * @param {string} firebaseTaskId - The unique identifier for the task being deleted.
 * @returns {Promise<void>} A promise that resolves when the task has been deleted.
 */
async function deleteTask(firebaseTaskId) {
    try {
        let apiUrl = await importConfig();
        let response = await fetchToBackend(`${apiUrl}/api/delete-task/${firebaseTaskId}`, 'DELETE'); 
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        closePopup();
        closeDeletePopup();
        clearTaskDisplay();
        await fetchTasks(); 
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task.');
    }
}

/**
 * Toggles the selection state of a user when a label is clicked, updating the checkbox, the visual style, and the `toAssignUser` array.
 * @param {HTMLElement} label - The `div` element containing the checkbox and user information.
 */
function toggleUser(label) {
    let checkbox = label.querySelector('input[type="checkbox"]');
    let userFullName = checkbox.getAttribute('data-name');

    checkbox.checked = !checkbox.checked;
    if (checkbox.checked) {
        if (!toAssignUser.includes(userFullName)) {
            toAssignUser.push(userFullName); 
        }
        label.classList.add("selected");
        label.style.color = "white";
    } else {
        const index = toAssignUser.indexOf(userFullName);
        if (index > -1) {
            toAssignUser.splice(index, 1);
        }
        label.classList.remove("selected");
        label.style.color = "black";
    }
}

/**
 * Edits an existing task by enabling field modifications and updating UI components.
 * Toggles field visibility for editing and sets up the environment to save changes.
 * Fetches and verifies user ID based on the task's assigned user.
 * @param {string} firebaseTaskId - The Firebase ID of the task to be edited.
 */
async function editTask(firebaseTaskId) {
    const task = tasksGlobal[firebaseTaskId];
    if (!task) {
        console.error('Task not found!', firebaseTaskId);
        return;
    }
    toggleFields(['Category', 'Title', 'Description', 'DueDate', 'Prio']);
    changePriority(task.priority);

    document.getElementById('subtasksContainer').querySelectorAll('.remove-subtask').forEach(button => button.classList.remove('d-none'));
    document.getElementById('subtasksContainer').querySelectorAll('.edit-subtask').forEach(button => button.classList.remove('d-none'));
    document.getElementById('subtasksContainer').querySelectorAll('.checkbox-subtask').forEach(button => button.classList.add('d-none'));

    const taskOptionsDiv = document.getElementById('taskOptions');
    taskOptionsDiv.innerHTML = `<button onclick="saveTask('${firebaseTaskId}')" class="save-btn">Ok <img src="./assets/img/check.svg"></button>`;

    toAssignUser = task.assigneeNames ? [...task.assigneeNames] : []; 
    await fetchAccountsAndFillDropdown();
    setupCheckboxHandlers();
    synchronizeCheckboxesWithArray();
}

/**
 * Synchronizes the state of checkboxes with the `toAssignUser` array, updating the visual appearance of the checkboxes and their labels.
 */
function synchronizeCheckboxesWithArray() {
    const checkboxes = document.querySelectorAll('#dropdownContent input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        const userFullName = checkbox.getAttribute('data-name');
        checkbox.checked = toAssignUser.includes(userFullName);
        const label = checkbox.closest('div');
        if (checkbox.checked) {
            label.classList.add("selected");
            label.style.color = "white";
        } else {
            label.classList.remove("selected");
            label.style.color = "";
        }
    });
}

/**
 * Updates the priority settings for a task based on user interaction, adjusting the UI to reflect the current priority.
 * @param {string} prio - The priority level to set ('urgent', 'medium', 'low').
 */
function changePriority(prio) {
    setPriority('urgent', prio, '#ff3d00', 'prio-urgent-white.png');
    setPriority('medium', prio, '#ffa800', 'prio-medium-white.png');
    setPriority('low', prio, '#7ae229', 'prio-low-white.png');
    document.getElementById('input-prio').innerHTML = prio;
}

/**
 * Sets the visual priority state for a task's priority button based on selection.
 * Changes the background color, text color, and image source of the priority button.
 * @param {string} currentPrio - The current priority level (e.g., 'low', 'medium', 'urgent').
 * @param {string} selectedPrio - The selected priority level to compare with the current.
 * @param {string} bgColor - The background color to set if currentPrio equals selectedPrio.
 * @param {string} imgName - The image filename to use if currentPrio equals selectedPrio.
 */
function setPriority(currentPrio, selectedPrio, bgColor, imgName) {
    let button = document.getElementById(`prio-${currentPrio}`);
    let img = document.getElementById(`img-prio-${currentPrio}`);
    if (currentPrio === selectedPrio) {
        button.style.background = bgColor;
        button.style.color = '#ffffff';
        img.src = `./assets/img/${imgName}`;
    } else {
        button.style.background = '';
        button.style.color = 'black';
        img.src = `./assets/img/prio-${currentPrio}-solo.png`;
    }
}

/**
 * Removes a subtask from a task in the global task list and requests backend to update.
 * Updates both the subtasks list and their checked status.
 * If successful, refreshes the task display; otherwise logs and alerts the error.
 * @param {string} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask to be removed.
 */
async function removeSubtask(firebaseTaskId, subtaskIndex) {
    const task = tasksGlobal[firebaseTaskId];
    if (!task) {
        console.error('Task not found!', firebaseTaskId);
        return;
    }
    task.subTasks.splice(subtaskIndex, 1); 
    try {
        let apiUrl = await importConfig();
        let response = await fetchToBackend(`${apiUrl}/api/edit-task/${firebaseTaskId}`, 'PATCH', JSON.stringify({ subTasks: task.subTasks }));

        if (!response.ok) {
            throw new Error('Failed to update subtasks');
        }
        await fetchTasks();
        openTask(firebaseTaskId);
    } catch (error) {
        console.error('Error updating subtasks:', error);
    }
}

/**
 * Removes a subtask from a task in the global task list and requests backend to update.
 * Updates both the subtasks list and their checked status.
 * If successful, refreshes the task display; otherwise logs and alerts the error.
 * @param {string} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask to be removed.
 */
async function removeSubtask(taskId, subtaskIndex) {
    try {
        let apiUrl = await importConfig();
        let response = await fetchToBackend(`${apiUrl}/api/remove-subtask/${taskId}/${subtaskIndex}`, 'PATCH');
        if (!response.ok) {
            throw new Error('Failed to remove subtask');
        }
        tasksGlobal[taskId].subTasks.splice(subtaskIndex, 1);
        tasksGlobal[taskId].subTasksChecked.splice(subtaskIndex, 1);
        openTask(taskId);
    } catch (error) {
        console.error('Error removing subtask:', error);
        alert('Error removing subtask.');
    }
}

/**
 * Saves updates to an existing task to the backend.
 * @param {string} firebaseTaskId - The unique identifier for the task being updated.
 * @returns {Promise<void>} A promise that resolves when the task has been updated.
 */
async function saveTask(firebaseTaskId) {
    updateAssigneesFromCheckboxes();
    try {
        let updatedTaskData = {
            title: document.getElementById('popupTitleInput').value,
            description: document.getElementById('popupDescriptionInput').value,
            dueDate: document.getElementById('popupDueDateInput').value,
            assigneeNames: toAssignUser,
            category: document.getElementById('popupCategoryInput').value,
            priority: document.getElementById('input-prio').innerHTML,
        };
        const apiUrl = await importConfig();
        let response = await fetchToBackend(`${apiUrl}/api/edit-task/${firebaseTaskId}`, 'PATCH', JSON.stringify(updatedTaskData))
        if (!response.ok) {
            throw new Error('Failed to save task updates');
        }

        closePopup();
        closeDeletePopup();
        clearTaskDisplay();
        resetInputFields();
        hideInputLabels();
        await fetchTasks(); 
    } catch (error) {
        console.error('Error saving task:', error);
        alert('Error saving task details.');
    }
}

/**
 * Hides input labels and the subtasks input in the popup by adding a 'd-none' class to them.
 *
 * @function hideInputLabels
 * @returns {void}
 */
function hideInputLabels() {
    document.getElementById('popupSubtasksInput').classList.add('d-none');
    document.querySelector(`label[for='popupSubtasksInput']`).classList.add('d-none');
    document.querySelector(`label[for='popupDescriptionInput']`).classList.add('d-none');
    document.querySelector(`label[for='popupTitleInput']`).classList.add('d-none');
}

/**
 * Updates the list of assignees based on the checked checkboxes in the dropdown.
 *
 * @function updateAssigneesFromCheckboxes
 * @returns {void}
 */
function updateAssigneesFromCheckboxes() {
    const checkboxes = document.querySelectorAll('#dropdownContent input[type="checkbox"]');
    toAssignUser = Array.from(checkboxes).filter(checkbox => checkbox.checked).map(checkbox => checkbox.getAttribute('data-name'));
}

/**
 * Asynchronously retrieves the profile color for a given user by their first and last name.
 * Caches the result in local storage to avoid future API calls.
 *
 * @async
 * @function getProfileColor
 * @param {string} firstName - The first name of the user.
 * @param {string} lastName - The last name of the user.
 * @returns {Promise<string|null>} The profile color of the user or null if not found or an error occurs.
 */
async function getProfileColor(firstName, lastName) {
    const fullName = firstName + " " + lastName;
    const cachedColor = localStorage.getItem(fullName);
    if (cachedColor) { return cachedColor; }
    try {
        let apiUrl = await importConfig();
        let fetchUrl = `${apiUrl}/api/accounts`;
        let response = await fetchToBackend(fetchUrl, 'GET');
        if (!response.ok) {
            throw new Error('Failed to fetch accounts');
        }
        let accounts = await response.json();
        for (let accountKey in accounts) {
            let account = accounts[accountKey];
            if (account.firstName === firstName && account.lastName === lastName) {
                localStorage.setItem(fullName, account.profileColor);
                return account.profileColor;
            }
        }
    } catch(e) {
        console.error('Error while fetching profile color:', e);
        return null;
    }
    return null;
}

/**
 * Enables editing mode for a specific subtask by replacing the subtask text with an input field.
 * @param {number} subtaskIndex - The index of the subtask to edit.
 */
function editSubtask(subtaskIndex) {
    let subTaskDiv = document.getElementById(`subtask-${subtaskIndex}`);
    let subtaskText = subTaskDiv.querySelector('li').textContent;
    let inputHtml = `<input type='text' value='${subtaskText}' class="editing-input" id='edit-subtask-${subtaskIndex}'>`;
    let saveButtonHtml = `<div onclick='saveEditedSubtask(${subtaskIndex})'><img style="filter: invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(1%) contrast(119%);"src='./assets/img/check.svg'></div>`;
    
    subTaskDiv.innerHTML = inputHtml;
    document.getElementById(`subtask-${subtaskIndex}-actions`).innerHTML = saveButtonHtml;

}

/**
 * Edits a subtask of the current task being edited.
 * @param {number} subtaskIndex - The index of the subtask to be edited.
 * @param {string} newSubtask - The new subtask text.
 */
async function saveEditedSubtask(subtaskIndex) {
    let newSubtask = document.getElementById('edit-subtask-' + subtaskIndex).value;
    let taskId = document.getElementById('popupTaskId').value;
    try {
        let apiUrl = await importConfig();
        let response = await fetchToBackend(`${apiUrl}/api/edit-subtask/${taskId}/${subtaskIndex}`, 'PATCH', JSON.stringify({ newSubtask }));
        if (!response.ok) {
            throw new Error('Failed to edit subtask');
        }
        editingSubtasks[subtaskIndex] = newSubtask;
        updateSubtaskListAfterEditing(taskId);
    } catch (error) {
        console.error('Error editing subtask:', error);
    }
}