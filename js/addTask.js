/**
 * Handles the sidebar loaded event by activating the sidebar task tab.
 */
function handleSidebarLoaded() {
    document.getElementById('sidebarAddTask').classList.add('sidebar-active');
}

/**
 * Initializes the main functionalities of the page, such as subtask input, task submission, and account fetching.
 */
function initializePage() {
    initializeSubtaskInput();
    initializeTaskSubmission();
    fetchAccountsAndFillDropdown();
}

/**
 * Initializes the event listener for the subtask input field to handle new subtasks.
 */
function initializeSubtaskInput() {
    let subTasks = [];

    document.getElementById('subtaskInput').addEventListener('keypress', function (event) {
        handleSubtaskInput(event, subTasks);
    });
}

/**
 * Initializes the task submission form and sets up a submit event listener.
 */
function initializeTaskSubmission() {
    const form = document.getElementById('add-task');
    if (form) {
        form.addEventListener('submit', handleTaskSubmission);
    } else {
        console.error('Form not found');
    }
}

/**
 * Handles the subtask input event, adding new subtasks when the "Enter" key is pressed.
 * @param {KeyboardEvent} event - The keypress event from the subtask input.
 * @param {Array<Object>} subTasks - The list of current subtasks.
 */
function handleSubtaskInput(event, subTasks) {
    if (event.key === 'Enter') {
        event.preventDefault();
        let subtaskValue = event.target.value.trim();
        if (subtaskValue) {
            subTasks.push({ text: subtaskValue, isEditing: false });
            event.target.value = '';
            updateSubtaskList(subTasks);
        }
    }
}

/**
 * Updates the subtask list displayed in the DOM.
 * @param {Array<Object>} subTasks - An array of subtask objects where each object represents a subtask.
 */
function updateSubtaskList(subTasks) {
    const subtaskListElement = document.getElementById('subtaskList');
    subtaskListElement.innerHTML = '';
    subTasks.forEach((subtask, index) => {
        subtaskListElement.appendChild(createSubtaskItem(subtask, index, subTasks));
    });
}

/**
 * Creates a DOM element representing a single subtask item.
 * @param {Object} subtask - The subtask object containing data for the subtask.
 * @param {number} index - The index of the subtask in the subtask array.
 * @param {Array<Object>} subTasks - The array of all subtasks.
 * @returns {HTMLElement} The `li` element representing the subtask.
 */
function createSubtaskItem(subtask, index, subTasks) {
    let li = document.createElement('li');
    li.classList.add('subtask-item');
    if (subtask.isEditing) {
        li.appendChild(createEditInput(subtask.text, index, subTasks));
    } else {
        li.appendChild(createTaskText(subtask.text));
        li.appendChild(createIconContainer(index, subTasks));
    }
    return li;
}

/**
 * Creates an editable input field for a subtask in edit mode.
 * @param {string} text - The text of the subtask to be edited.
 * @param {number} index - The index of the subtask in the subtask array.
 * @param {Array<Object>} subTasks - The array of all subtasks.
 * @returns {HTMLElement} A `div` element containing the input field and save icon.
 */
function createEditInput(text, index, subTasks) {
    let input = document.createElement('input');
    input.type = 'text';
    input.value = text;
    input.classList.add('edit-input');
    let confirmIcon = document.createElement('img');
    confirmIcon.src = 'assets/img/check-subtask.png';
    confirmIcon.alt = 'Save Icon';
    confirmIcon.classList.add('custom-save-icon');
    confirmIcon.addEventListener('click', () => saveSubtask(index, input.value, subTasks));
    let container = document.createElement('div');
    container.classList.add('input-save-icon-div');
    container.appendChild(input);
    container.appendChild(confirmIcon);
    return container;
}

/**
 * Creates a DOM element to display the text of a subtask.
 * @param {string} text - The text content of the subtask.
 * @returns {HTMLElement} A `span` element containing the subtask text.
 */
function createTaskText(text) {
    let taskText = document.createElement('span');
    taskText.textContent = text;
    return taskText;
}

/**
 * Creates a container with edit and delete icons for a subtask.
 * @param {number} index - The index of the subtask in the subtask array.
 * @param {Array<Object>} subTasks - The array of all subtasks.
 * @returns {HTMLElement} A `span` element containing the edit and delete icons.
 */
function createIconContainer(index, subTasks) {
    let iconContainer = document.createElement('span');
    iconContainer.classList.add('icon-container');
    let editIcon = createIcon('assets/img/edit.png', 'Edit Icon', () => editSubtask(index, subTasks));
    let deleteIcon = createIcon('assets/img/delete.png', 'Delete Icon', () => deleteSubtask(index, subTasks));
    iconContainer.appendChild(editIcon);
    iconContainer.appendChild(deleteIcon);
    return iconContainer;
}

/**
 * Creates an icon element with specified image source, alternative text, and click event.
 * @param {string} src - The source URL of the icon image.
 * @param {string} alt - The alternative text for the icon image.
 * @param {Function} onClick - The function to execute when the icon is clicked.
 * @returns {HTMLElement} An `img` element representing the icon.
 */
function createIcon(src, alt, onClick) {
    let icon = document.createElement('img');
    icon.src = src;
    icon.alt = alt;
    icon.classList.add(`custom-${alt.toLowerCase().replace(' ', '-')}-icon`);
    icon.addEventListener('click', onClick);
    return icon;
}

/**
 * Edits a subtask by setting it into edit mode.
 * @param {number} index - The index of the subtask to edit.
 * @param {Array<Object>} subTasks - The list of current subtasks.
 */
function editSubtask(index, subTasks) {
    subTasks[index].isEditing = true;
    updateSubtaskList(subTasks);
}

/**
 * Saves the edited subtask text.
 * @param {number} index - The index of the subtask being edited.
 * @param {string} newText - The new text for the subtask.
 * @param {Array<Object>} subTasks - The list of current subtasks.
 */
function saveSubtask(index, newText, subTasks) {
    subTasks[index].text = newText;
    subTasks[index].isEditing = false;
    updateSubtaskList(subTasks);
}

/**
 * Deletes a subtask from the list.
 * @param {number} index - The index of the subtask to delete.
 * @param {Array<Object>} subTasks - The list of current subtasks.
 */
function deleteSubtask(index, subTasks) {
    subTasks.splice(index, 1);
    updateSubtaskList(subTasks);
}

/**
 * Handles the task submission process, including form validation and data submission.
 * @param {Event} event - The form submission event.
 * @returns {Promise<void>} A promise that resolves when the task submission is complete.
 */
async function handleTaskSubmission(event) {
    event.preventDefault();
    let taskData = collectTaskData();
    resetErrorMessages();
    if (!validateTaskData(taskData)) return;
    try {
        await submitTask(taskData);
    } catch (error) {
        handleSubmissionError(error);
    }
}

/**
 * Collects and returns the task data from the form.
 * @returns {Object} An object containing the task data.
 */
function collectTaskData() {
    return {
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        dueDate: document.getElementById('date').value.trim(),
        assigneeNames: toAssignUser,
        category: document.getElementById('categorySelect').value.trim(),
        priority: document.getElementById('input-prio').innerHTML.trim(),
        subTasks: getSubTasks().join(', ')
    };
}

/**
 * Validates the task data to ensure all required fields are filled.
 * @param {Object} taskData - The task data to validate.
 * @returns {boolean} Returns `true` if the task data is valid, otherwise `false`.
 */
function validateTaskData(taskData) {
    let isValid = true;
    if (!taskData.title) { showError('title', 'Title is required'); isValid = false; }
    if (!taskData.description) { showError('description', 'Description is required'); isValid = false; }
    if (!taskData.dueDate) { showError('date', 'Due date is required'); isValid = false; }
    if (!taskData.category) { showError('categorySelect', 'Category is required'); isValid = false; }
    return isValid;
}

/**
 * Handles errors that occur during task submission.
 * @param {Error} error - The error object representing the submission failure.
 */
function handleSubmissionError(error) {
    console.error('Error adding task:', error);
    alert('Failed to add task due to an internal error');
}

/**
 * Handles the task submission event, validating inputs and submitting data to the backend.
 * @param {SubmitEvent} event - The submit event from the task form.
 */
function showError(fieldId, message) {
    const errorElement = document.getElementById(`error-message-${fieldId}`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        console.error(`Error element not found for ${fieldId}`);
    }
}

/**
 * Resets all error messages displayed in the form.
 */
function resetErrorMessages() {
    document.querySelectorAll('.error-message').forEach(errorElement => {
        errorElement.style.display = 'none';
    });
}

/**
 * Retrieves the list of subtasks from the DOM.
 * @returns {Array<string>} The list of subtask texts.
 */
function getSubTasks() {
    let subTasks = [];
    document.querySelectorAll('#subtaskList li').forEach(subtask => {
        subTasks.push(subtask.textContent);
    });
    return subTasks;
}

/**
 * Submits the task data to the backend API.
 * @param {Object} taskData - The task data to be submitted.
 */
async function submitTask(taskData) {
    let apiUrl = await importConfig();
    let response = await fetchToBackend(`${apiUrl}/api/add-task`, 'POST', JSON.stringify(taskData), {
        headers: { 'Content-Type': 'application/json' }
    });
    let result = await response.json();
    if (response.ok) {
        handleSuccessfulTaskSubmission();
    } else {
        alert(`Failed to add task: ${result.message}`);
    }
}

/**
 * Handles a successful task submission by resetting the form and redirecting the user.
 */
function handleSuccessfulTaskSubmission() {
    setSuccessMessage('Task added successfully');
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('date').value = '';
    clearSubtaskList();
    resetAllCheckboxes();
    setTimeout(function () {
        window.location.href = './board.html';
    }, 2000);
}

/**
 * Clears the list of subtasks from the DOM and resets the list.
 */
function clearSubtaskList() {
    let subTasks = [];
    updateSubtaskList(subTasks);
}

/**
 * Resets all checkboxes to their default unchecked state.
 */
function resetAllCheckboxes() {
    let checkboxes = document.querySelectorAll('#dropdownContent input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    document.getElementById('selectedUsers').innerHTML = '';
    toAssignUser = [];
    let selectedElements = Array.from(document.getElementsByClassName('selected'));
    selectedElements.forEach(element => {
        element.classList.remove('selected');
        if (element.style) {
            element.style.color = 'black';
        }
    });
}

/**
 * Changes the priority of the task and updates the corresponding UI elements.
 * @param {string} prio - The priority level ('urgent', 'medium', 'low').
 */
function changePriority(prio) {
    if (prio === 'urgent') {
        setPriorityStyles('prio-urgent', '#ff3d00', 'prio-urgent-white', 'urgent');
        resetButtons('prio-medium', 'prio-low');
    } else if (prio === 'medium') {
        setPriorityStyles('prio-medium', '#ffa800', 'prio-medium-white', 'medium');
        resetButtons('prio-urgent', 'prio-low');
    } else if (prio === 'low') {
        setPriorityStyles('prio-low', '#7ae229', 'prio-low-white', 'low');
        resetButtons('prio-medium', 'prio-urgent');
    }
}

/**
 * Sets the styles for the priority buttons.
 * @param {string} buttonId - The ID of the button to style.
 * @param {string} bgColor - The background color for the button.
 * @param {string} imgSuffix - The suffix for the image associated with the button.
 * @param {string} priorityText - The text representing the priority.
 */
function setPriorityStyles(buttonId, bgColor, imgSuffix, priorityText) {
    let button = document.getElementById(buttonId);
    button.style.background = bgColor;
    button.style.color = '#ffffff';
    document.getElementById(`img-${buttonId}`).src = `./assets/img/${imgSuffix}.png`;
    document.getElementById('input-prio').innerHTML = priorityText;
}

/**
 * Resets the styles for priority buttons not currently selected.
 * @param {string} button1 - The ID of the first button to reset.
 * @param {string} button2 - The ID of the second button to reset.
 */
function resetButtons(button1, button2) {
    document.getElementById(button1).style.background = '';
    document.getElementById(button1).style.color = 'black';
    document.getElementById(button2).style.color = 'black';
    document.getElementById(button2).style.background = '';
    let b1 = 'img-' + button1;
    let b2 = 'img-' + button2;
    document.getElementById(b1).src = `./assets/img/${button1}-solo.png`;
    document.getElementById(b2).src = `./assets/img/${button2}-solo.png`;
}

/**
 * Sets up handlers for the checkbox elements in the dropdown.
 */
function setupCheckboxHandlers() {
    document.querySelectorAll('#dropdownContent input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
}

/**
 * Handles the change event for checkboxes to update the selection of users.
 * @param {Event} event - The checkbox change event.
 */
function handleCheckboxChange(event) {
    event.stopPropagation();
    toggleUser(this.parentElement);
}

/**
 * Clears all form fields and resets the page state.
 */
function clearAllFields() {
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('date').value = '';
    subTasks = [];
    document.getElementById('subtaskList').innerHTML = '';
    document.getElementById('selectedUsers').innerHTML = '';
    toAssignUser = [];
    document.getElementById('subtaskInput').value = '';
    window.location.href = './add-task.html';
}

document.addEventListener('sidebarLoaded', handleSidebarLoaded);
document.addEventListener('DOMContentLoaded', initializePage);