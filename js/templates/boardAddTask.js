function addTaskOnBoard() {
    return `
        <div id="addTaskContent" class="addTaskContent">
            <div id="mainHeadline" class="mainHeadline verstecken">
                <h1 class="addTask-header">Add Task</h1>
            </div>
            <form id="add-task">
                <div id="taskContent" class="taskContent">
                    <div id="taskContentLeft" class="taskContentLeft">
                        <div class="addToTaskInputSection">
                            <span class="addTask-Subheaders">Title<span style="color:red">*</span></span>
                            <input placeholder="Enter a title" required class="addTotaskInputField " id="title">
                        </div>
                        <div class="addToTaskInputSection">
                            <span class="addTask-Subheaders">Description<span style="color:red">*</span></span>
                            <textarea required id="description" placeholder="Enter a description"
                                class="input-description"></textarea>
                        </div>
                        <div class="addToTaskInputSection">
                            <span class="addTask-Subheaders">Assign to</span>
                            <div class="dropdown">
                                <input type="text" placeholder="Select contacts to assign"
                                    style="padding: 8px; box-sizing: border-box;" id="dropdownInput"
                                    onclick="toggleDropdown()">
                                <div class="dropdown-content" id="dropdownContent"></div>
                            </div>
                            <div class="selected-users" id="selectedUsers"></div>
                        </div>
                    </div>
                    <div id="taskContentRight" class="taskContentRight">
                        <div class="addToTaskInputSectionRight">
                            <span class="addTask-Subheaders">Due date<span style="color:red">*</span></span>
                            <input type="date" name="today" placeholder="" class="addTotaskInputField" id="date"
                                min="2024-07-15">
                            <div class="priority-container">
                                <p class="form-title">Prio</p>
                                <div>
                                    <div id="prio-urgent-add-task" onclick="changePriorityAddTask('urgent')" class="priority-icons">Urgent
                                        <img id="img-prio-urgent-add-task" src="./assets/img/prio-urgent-solo.png"
                                            alt="Priority urgent">
                                    </div>
                                    <div style="background-color: rgb(255, 168, 0);color: #ffffff;" id="prio-medium-add-task"
                                        onclick="changePriorityAddTask('medium')" class="priority-icons">Medium
                                        <img id="img-prio-medium-add-task" src="./assets/img/prio-medium-white.png"
                                            alt="Priority medium">
                                    </div>
                                    <div id="prio-low-add-task" onclick="changePriorityAddTask('low')" class="priority-icons">Low
                                        <img id="img-prio-low-add-task" src="./assets/img/prio-low-solo.png" alt="Priority low">
                                    </div>
                                    <div id="input-prio-add-task" type="text" class="d-none">medium</div>
                                </div>
                            </div>
                            <div class="addToTaskInputSection">
                                <span class="addTask-Subheaders">Category<span style="color:red">*</span></span>
                                <select id="categorySelect" class="addTotaskInputField">
                                    <option value="technicalTask">Technical Task</option>
                                    <option value="userStory">User Story</option>
                                </select>
                            </div>
                            <div class="addToTaskInputSection">
                                <span class="addTask-Subheaders">Subtasks</span>
                                <input type="text" id="subtaskInput" placeholder="Enter a subtask"
                                    class="addTotaskInputField">
                                <div id="subtaskList"></div>
                            </div>
                        </div>
    
                    </div>
    
                </div>
                <div class="form-footer">
                    <div class="requiredfield">
                        <p style="color:red">*</p>
                        <p>This field is required</p>
                    </div>
    
                    <div class="btnRow">
                        <button onclick="clearAllFieldsOnAddTask()" type="button" id="clearFields">Clear X</button>
                        <button class="submit">Create Task ✓</button>
                    </div>
    
                </div>
    
            </form>
    
    
            <div id="success" class="d-none slide-in">
                <div id="successMessage"></div>
            </div>
    `;
}