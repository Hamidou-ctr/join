/**
 * Initializes dragging of a task element by setting the data transfer payload.
 * @param {DragEvent} e - The event associated with the start of a drag.
 */
function handleDragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.id);
}

/**
 * Prevents the default handling of an element to allow dropping.
 * @param {DragEvent} e - The event where a drag over occurs.
 */
function allowDrop(e) {
    e.preventDefault();
    let targetBox = e.target.closest('.task-box');
    if (targetBox) {
        document.querySelectorAll('.task-box.highlighted').forEach(box => box.classList.remove('highlighted'));
        targetBox.classList.add('highlighted');
    }
}

/**
 * Handles the drag leave event by removing the highlight from the target task box
 * when the dragged item leaves the box.
 * @param {DragEvent} e - The drag leave event.
 */
function dragLeave(e) {
    let targetBox = e.target.closest('.task-box');
    if (targetBox && (!e.relatedTarget || !targetBox.contains(e.relatedTarget))) {
        targetBox.classList.remove('highlighted');
    }
}

/**
 * Updates the state of a task in the backend based on its new state in the UI.
 * Handles errors by logging and potentially alerting the user.
 * @param {string} taskId - The ID of the task being updated.
 * @param {string} newState - The new state of the task (e.g., 'todo', 'in-progress').
 */
async function updateTaskState(taskId, newState) {
    try {
        let apiUrl = await importConfig();
        const response = await fetchToBackend(`${apiUrl}/api/edit-task-state/${taskId}`, 'PATCH', JSON.stringify({ newState }));
        if (!response.ok) {
            throw new Error('Task status update failed');
        }
    } catch (error) {
        console.error('Error updating task status:', error);
    }
}

/**
 * Handles the drop event when a task is moved to a new task box.
 *
 * @param {DragEvent} event - The drop event containing the data being transferred.
 * @param {string} targetId - The ID of the target task box where the task is dropped.
 */
function handleDrop(event, targetId) {
    event.preventDefault();
    event.stopPropagation();

    const data = event.dataTransfer.getData("text");
    const taskElement = document.getElementById(data);
    const targetBox = document.getElementById(targetId);
    const sourceBox = taskElement.parentNode;

    targetBox.appendChild(taskElement);
    document.querySelectorAll('.task-box.highlighted').forEach(box => box.classList.remove('highlighted'));
    
    updateTaskState(data, targetId.replace('-box', ''));
    checkAndUpdateTaskBoxes(sourceBox, targetBox);
}

document.addEventListener('dragend', () => {
    document.querySelectorAll('.task-box.highlighted').forEach(box => box.classList.remove('highlighted'));
});

document.querySelectorAll('.task-box').forEach(box => {
    box.addEventListener('dragover', allowDrop);
    box.addEventListener('dragleave', dragLeave);
    box.addEventListener('drop', handleDrop);
});

/**
 * Checks the source and target task boxes and updates their contents 
 * based on whether they contain any tasks.
 *
 * @param {HTMLElement} sourceBox - The original task box from where the task was dragged.
 * @param {HTMLElement} targetBox - The target task box where the task was dropped.
 */
function checkAndUpdateTaskBoxes(sourceBox, targetBox) {
    if (sourceBox.children.length === 0) {
        let noTasksDiv = document.createElement('div');
        noTasksDiv.textContent = getNoTaskMessage(sourceBox.id.replace('-box', ''));
        noTasksDiv.className = 'no-tasks';
        sourceBox.appendChild(noTasksDiv);
    }

    const noTaskElement = targetBox.querySelector('.no-tasks');
    if (noTaskElement && targetBox.children.length > 1) {
        targetBox.removeChild(noTaskElement);
    }
}

/**
 * Returns a message indicating that there are no tasks in a given category.
 *
 * @param {string} category - The category of the task box (e.g., 'todo', 'in-progress', etc.).
 * @returns {string} A message specific to the category indicating no tasks are present.
 */
function getNoTaskMessage(category) {
    switch (category) {
        case 'todo':
            return 'No tasks to do.';
        case 'in-progress':
            return 'No tasks in progress.';
        case 'awaiting-feedback':
            return 'No tasks awaiting feedback.';
        case 'done':
            return 'No tasks done.';
        default:
            return 'No tasks found.';
    }
}