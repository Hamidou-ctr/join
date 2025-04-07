/**
 * Generates and returns HTML for a task element, including category, title, description, subtasks, assignees, and priority.
 *
 * @function createTaskElementHtml
 * @param {string} category - The task category (e.g., "technicalTask", "userStory").
 * @param {string} categoryName - The display name of the category.
 * @param {string} title - The title of the task.
 * @param {string} description - The description of the task.
 * @param {string} firebaseTaskId - The task ID of the Firebase task.
 * @param {number} subTasksLength - The total number of subtasks.
 * @param {number} subTasks - The number of completed subtasks.
 * @param {string} assigneesHTML - HTML representing the assignees of the task.
 * @param {string} priorityUrl - The URL for the priority image.
 * @returns {string} The HTML string for the task element.
 */
function createTaskElementHtml(category, categoryName, title, description, firebaseTaskId, subTasksLength, subTasks, assigneesHTML, priorityUrl) {
    let trimmedDescription = description;
    if (description.length > 75) {
        trimmedDescription = description.substring(0, 72) + '...';
    }
    let html = /*html*/`
        <div class="${category}" style="font-size: 18px;max-width:170px;">${categoryName}</div>
        <h4>${title}</h4>
        <p id="${firebaseTaskId}-description">${trimmedDescription}</p>
        <div class="tasks-subtasks">
            <progress id="${firebaseTaskId}-progress" max="${subTasksLength}" value="${subTasks}"></progress>
            <p id="${firebaseTaskId}-p">${subTasksLength} Subtasks</p>
        </div>
        <div id="task-priority">
            <div id="task-meta">
                ${assigneesHTML}
            </div>
            <div class="task-priority-img">
                <img src="${priorityUrl}" alt="priority"></div>
            </div>
        </div>`;
    return html;
}

/**
 * Generates and returns HTML for a subtask list item, including a checkbox and actions (edit and remove).
 *
 * @function updateSubtaskListHtml
 * @param {string} subtask - The name of the subtask.
 * @param {number} index - The index of the subtask.
 * @param {boolean} isChecked - Whether the subtask is completed (checked).
 * @returns {string} The HTML string for the subtask list item.
 */
function updateSubtaskListHtml(subtask, index, isChecked) {
    let html = /*html*/`
    <div id="subtask-${index}" class="subtask-item">
        <input class="checkbox-subtask" type="checkbox" data-index="${index}" onclick="checkboxEditingSubtask(${index})" ${isChecked ? 'checked' : ''}>
        <li>${subtask}</li>
    </div>
    <div id="subtask-${index}-actions">
        <div class="edit-subtask d-none" onclick="editSubtask(${index})"><img src="./assets/img/edit.svg"></div>
        <button class="remove-subtask d-none" onclick="removeEditingSubtask(${index})"><img src="./assets/img/delete.png"></button>
    </div>
    `;
    return html;
}

/**
 * Triggers the display of a window to add a new task.
 * @returns {void}
 */
function addNewTask() {
    document.body.classList.add('overflow-hidden');
    document.getElementById('show-addTaskInclude').innerHTML = /*html*/ `
        <div w3-include-html="add-TaskInclude.html" ></div>`;
    includeHTMLaddTask();
}

/**
 * Generates and returns HTML for a subtask element, including a checkbox, subtask text, and action buttons (edit and remove).
 *
 * @function subtaskElementHml
 * @param {number} index - The index of the subtask.
 * @param {boolean} isChecked - Whether the subtask is completed (checked).
 * @param {string} subtask - The text of the subtask.
 * @returns {string} The HTML string for the subtask element.
 */
function subtaskElementHml(index, isChecked, subtask) {
    let html = /*html*/`
    <div id="subtask-${index}" class="subtask-item">
        <input class="checkbox-subtask d-none" type="checkbox" data-index="${index}" onclick="checkboxEditingSubtask(${index})" ${isChecked ? 'checked' : ''}>
        <li>${subtask}</li>
    </div>
    <div id="subtask-${index}-actions">
        <div class="edit-subtask" onclick="editSubtask(${index})"><img src="./assets/img/edit.svg"></div>
        <button class="remove-subtask" onclick="removeEditingSubtask(${index})"><img src="./assets/img/delete.png"></button>
    </div>
    `;
    return html;
}