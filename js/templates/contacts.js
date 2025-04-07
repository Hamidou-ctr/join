function contactDetailsPopup(firstName, lastName, color, initials, email, phone, id) {
return `
    <div id="mobile-contact-details-popup" class="modal d-none" onclick="closeContactsPopup()">
        	<div id="contact-details-modal" class="modal-content" onclick="event.stopPropagation()">
                <div id="contact-headline-mobile" class="headline-index-contact">
                    <h1>Contacts</h1>
                    <img id="headline-bar" src="./assets/img/headline-bar.png">
                    <text>Better with a team</text>
                </div>
                <div id="closeContactsPopup" onclick="closeContactsPopup();"><img src="./assets/img/blue-arrow-left.png"></div>
        	    <div class="contact-header">
        	    	<div class="initials" style="background-color: ${color}">${initials}</div>
        	    	<div>
        	    	    <span>${firstName} ${lastName}</span>
        	    	</div>
        	    </div>
                <div class="mobile-contact-details">
        	    	<h2>Contact information</h2>
        	    	<div>
        	    	    <p><b>Email</b></p>
                        <p id="popup-mail"><a href="mailto:${email}">${email}</a></p>
                        <p><b>Phone</b></p>
                        <p id="popup-phone"><a href="tel:${phone}">${phone}</a></p>
        	    	</div>
                </div>
                <div id="mobile-action-button" onclick="showContactActions()"><p>...</p></div>
        <div class="modal-backdrop" onclick="closeContactsPopup()">
            <div id="mobile-action-button-options" class="d-none">
                <div onclick="editContact('${id}')"><img alt="edit contact" src="./assets/img/edit.png"></div>
                <div onclick="deleteContact('${id}')"><img alt="edit contact" src="./assets/img/delete.png"></div>
            </div>
        </div>
    </div>`;
}

function contactDetails(firstName, lastName, id, initials, color, email, phone) {
    return `
        <div class="contact-header">
            <div id="initials-picture-${id}" class="initials" style="background-color: ${color}">${initials}</div>
            <div>
                <span>${firstName} ${lastName}</span>
                <div class="action-buttons">
                    <div onclick="editContact('${id}')" class="pointer"><img alt="edit contact" src="./assets/img/edit.png">Edit</div>
                    <div onclick="deleteContact('${id}')" class="pointer"><img alt="edit contact" src="./assets/img/delete.png">Delete</div>
                </div>
            </div>
        </div>
        <div>
            <h2>Contact information</h2>
            <div>
                <p><b>Email</b></p>
                <p><a href="mailto:${email}">${email}</a></p>
                <p><b>Phone</b></p>
                <p><a href="tel:${phone}">${phone}</a></p>
            </div>
        </div>
        </div>`;
}

function editFormHtml(contactfirstName, contactlastName, contactemail, contactphone, contactcolor, contactid) {
    return `
    <div class="edit-input" style="margin-top: 20px;">
        <label for="firstName" class="d-none">First Name:</label>
        <input type="text" id="firstName" name="firstName" value="${contactfirstName}">
        <img src="./assets/img/body-logo.png" alt="first name">
    </div>
    <div class="edit-input">
        <label for="lastName" class="d-none">Last Name:</label>
        <input type="text" id="lastName" name="lastName" value="${contactlastName}">
        <img src="./assets/img/body-logo.png" alt="last name">
    </div>
    <div class="edit-input">
        <label for="email" class="d-none">Email:</label>
        <input type="email" id="email" name="email" value="${contactemail}" required pattern="^[^\s@]+@[^\s@]+\.[^\s@]{2,}$" title="Please enter a valid e-mail address with a domain (e.g john.doe@gmail.com)">
        <img src="./assets/img/mail.svg" alt="mail address">
    </div>
    <div class="edit-input">
        <label for="phone" class="d-none">Phone:</label>
        <input type="tel" id="phone" name="phone" value="${contactphone}">
        <img src="./assets/img/phone-logo.png" alt="phone number">
    </div>
    <div class="edit-input">
        <label for="color">Profile color:</label>
        <input type="color" id="color" name="color" value="${contactcolor}">
        <img src="./assets/img/colorpicker.png" alt="profile color">
    </div>
    <div class="add-contact-buttons">
        <button class="btn-cancel" type="button" onclick="closeEditPopup()">Cancel X</button>
        <button class="btn-create" type="button" onclick="saveContact('${contactid}')">Save</button>
    </div>
    `;
}