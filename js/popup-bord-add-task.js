/**
 * Opens a popup by removing the 'd-none' class from the popup container, displaying the overlay, 
 * and adding task content to the popup container.
 */
function openPopup() {
    document.getElementById('popupContainer').classList.remove('d-none');
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('popupContainer').innerHTML = addTaskOnBoard();
}

/**
 * Updates the priority settings for a task based on user interaction, adjusting the UI to reflect the current priority.
 * @param {string} prio - The priority level to set ('urgent', 'medium', 'low').
 */
function changePriorityAddTask(prio) {
    if (prio === "urgent") {
        document.getElementById('prio-urgent-add-task').style.background = '#ff3d00';
        document.getElementById('prio-urgent-add-task').style.color = '#ffffff';
        document.getElementById('img-prio-urgent-add-task').src = './assets/img/prio-urgent-white.png';
        document.getElementById('input-prio-add-task').innerHTML = 'urgent';
        resetButtons("prio-medium-add-task", "prio-low-add-task");
    } else if (prio === "medium") {
        document.getElementById('prio-medium-add-task').style.background = '#ffa800';
        document.getElementById('prio-medium-add-task').style.color = '#ffffff';
        document.getElementById('img-prio-medium-add-task').src = './assets/img/prio-medium-white.png';
        document.getElementById('input-prio-add-task').innerHTML = 'medium';
        resetButtons("prio-urgent-add-task", "prio-low-add-task");
    } else if (prio === "low") {
        document.getElementById('prio-low-add-task').style.background = '#7ae229';
        document.getElementById('prio-low-add-task').style.color = '#ffffff';
        document.getElementById('img-prio-low-add-task').src = './assets/img/prio-low-white.png';
        document.getElementById('input-prio-add-task').innerHTML = 'low';
        resetButtons("prio-medium-add-task", "prio-urgent-add-task");
    }
}

/**
 * Resets the style and appearance of two priority buttons back to their default state.
 * @param {string} button1 - The first button to reset.
 * @param {string} button2 - The second button to reset.
 */
function resetAddTasksButtons(button1, button2) {
    document.getElementById(button1).style.background = '';
    document.getElementById(button1).style.color = 'black';
    document.getElementById(button2).style.color = 'black';              
    document.getElementById(button2).style.background = '';
    let b1 = 'img-' + button1;
    let b2 = 'img-' + button2;
    document.getElementById(b1).src = './assets/img/' + button1 + '-solo.png';
    document.getElementById(b2).src = './assets/img/' + button2 + '-solo.png';

}

/**
 * Fetches accounts from the backend and populates the dropdown for task assignment.
 * This function handles fetching, error reporting, and updates the UI to show available accounts.
 * @returns {Promise<void>} A promise that resolves when the operation is complete, updating the dropdown with user accounts.
 */
async function fetchAccountsAndFillDropdown() {
    try {
        let apiUrl = await importConfig();
        let response = await fetchToBackend(`${apiUrl}/api/accounts`, 'GET');
        if (!response.ok) {
            throw new Error('Failed to fetch accounts');
        }

        let accounts = await response.json();
        let dropdown = document.getElementById('dropdownContent');
        dropdown.innerHTML = '';

        Object.keys(accounts).forEach(key => {
            let user = accounts[key];
            let isChecked = toAssignUser.includes(`${user.firstName} ${user.lastName}`);
            let userDiv = document.createElement('div');
            userDiv.setAttribute('onclick', 'toggleUser(this)');
            userDiv.className = isChecked ? "selected" : "";
            userDiv.style.color = isChecked ? "white" : "";
            userDiv.innerHTML = `
                <div>
                    <span class="user-icon" style="background-color: ${user.profileColor};">${user.initials}</span>
                    ${user.firstName} ${user.lastName}
                    <input type="checkbox" value="${key}" data-name="${user.firstName} ${user.lastName}" data-color="${user.profileColor}" class="d-none checkbox" ${isChecked ? 'checked' : ''}>
                </div>
                <div id="checkbox-unchecked"> 
                    <span id="check-hook-sign" class="d-none check-hook-sign" >&#10003;</span> 
                </div>
                `;
            dropdown.appendChild(userDiv);
        });
        setupCheckboxHandlers();

    } catch (error) {
        console.error('Error fetching accounts:', error);
    }
}