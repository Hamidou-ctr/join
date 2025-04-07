/**
 * Listens for the 'sidebarLoaded' event and adds the 'sidebar-active' class
 * to the 'sidebarContacts' element once the sidebar has been fully loaded.
 * This highlights the 'sidebarContacts' element as active, indicating that it
 * is the current page or focus within the application.
 * @event sidebarLoaded
 * @listens sidebarLoaded - Triggers when the sidebar content is fully loaded and ready.
 */
document.addEventListener('sidebarLoaded', function () {
    document.getElementById('sidebarContacts').classList.add('sidebar-active');
});

/**
 * Handles initial page load setup by hiding the loader and fetching necessary CSRF token and contact data.
 */
document.addEventListener('DOMContentLoaded', async function () {
    hideLoader();
    await getCsrfToken();
    await fetchAndDisplayContacts();
});

/**
 * Fetches and displays contacts by retrieving the CSRF token and making an API request to get contacts.
 * @returns {Promise<void>} A promise that resolves when the contacts have been fetched and displayed.
 */
async function fetchAndDisplayContacts() {
    try {
        let apiUrl = await importConfig();
        let fetchUrl = `${apiUrl}/api/contacts`;
        const response = await fetchToBackend(fetchUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch contacts');
        }
        const contacts = await response.json();
        processAndDisplayContacts(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        document.getElementById('contact-list').innerHTML = '<p>Error loading contacts.</p>';
    }
}

/**
 * Processes and displays sorted contact data in the UI.
 * Sorts the contact objects by first name and then renders them grouped by the initial letter of their first names.
 * @param {Array} contacts - Array of contact objects to process and display.
 */
function processAndDisplayContacts(contacts) {
    const sortedContacts = Object.values(contacts).sort((a, b) => a.firstName.localeCompare(b.firstName));
    filterAndRenderContacts(sortedContacts);
}

/**
 * Filters and renders contact entries grouped by the first letter of their first name.
 * @param {Array} sortedContacts - The sorted list of contact objects.
 * @returns {void}
 */
function filterAndRenderContacts(sortedContacts) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    let contactSection = document.getElementById('contact-list');
    contactSection.innerHTML = '';

    letters.forEach(letter => {
        const filteredContacts = sortedContacts.filter(contact => contact.firstName.toUpperCase().startsWith(letter));
        if (filteredContacts.length > 0) {
            renderLetterSection(filteredContacts, letter);
        }
    });
}

/**
 * Renders a section in the UI for contacts starting with the same letter.
 * @param {Array} contacts - List of contacts to render under a specific letter section.
 * @param {string} letter - The letter used to group the contacts.
 * @returns {void}
 */
function renderLetterSection(contacts, letter) {
    let letterSection = document.createElement('div');
    letterSection.className = 'letter-section';
    letterSection.innerHTML = `<div class="first-char">${letter}</div>`;
    contacts.forEach(contact => {
        letterSection.appendChild(createContactElement(contact));
    });
    document.getElementById('contact-list').appendChild(letterSection);
}

/**
 * Creates a DOM element representing a single contact, displaying the contact's initials, name, and email.
 * The created element includes interactive elements that respond to user actions.
 * @param {Object} contact - Contact object containing data to populate the UI.
 * @returns {HTMLElement} The DOM element created for the contact, which can be appended to the document.
 */
function createContactElement(contact) {
    let firstNameLetter = contact.firstName.charAt(0).toUpperCase();
    let lastNameLetter = contact.lastName.charAt(0).toUpperCase();
    let contactElement = document.createElement('div');
    contactElement.className = 'contact-entry';
    contactElement.innerHTML = `
        <div class="same-letters">
        <div onclick="showContactDetails('${contact.id}')" id="contact-card-${contact.id}" class="contact-card">
        <div id="contact-img-${contact.id}" class="contact-img" style="background-color: ${contact.color};">${firstNameLetter}${lastNameLetter}</div>
        <div id="contactInfo-${contact.id}" class="contact-info">
            <span>${contact.firstName} ${contact.lastName}</span>
            <p>${contact.email}</p>
        </div>
    `;
    return contactElement;
}

/**
 * Displays detailed information for a specific contact.
 * @param {string} contactId - The unique identifier for the contact.
 * @returns {Promise<void>} A promise that resolves when the contact details are displayed.
 */
async function showContactDetails(contactId) {
    let elements = document.getElementsByClassName('active');
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove('active');
    } !document.getElementById('contact-card-' + contactId).classList.contains('active') ? document.getElementById('contact-card-' + contactId).classList.add('active') : null;
    try {
        let apiUrl = await importConfig();
        let fetchUrl = `${apiUrl}/api/contact/${contactId}`;
        const response = await fetchToBackend(fetchUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch contact details');
        }
        const contactDetails = await response.json();
        renderContactDetails(contactDetails);
        document.getElementById('mobile-contact-details-popup').classList.remove('d-none');
    } catch (error) {
        console.error('Error fetching contact details:', error);
        document.getElementById('contact-details').innerHTML = '<p>Error loading contact details.</p>';
    }
}

/**
 * Initiates the contact editing process by fetching contact details and displaying them in a form for editing.
 * @param {string} contactId - The unique identifier for the contact to edit.
 * @returns {Promise<void>} A promise that resolves when the edit form is displayed with the contact's current details.
 */
async function editContact(contactId) {
    try {
        let apiUrl = await importConfig();
        const response = await fetchToBackend(`${apiUrl}/api/contact/${contactId}`, 'GET');
        if (!response.ok) {
            throw new Error(`Failed to fetch contact details: ${response.statusText}`);
        }
        const contactDetails = await response.json();
        document.getElementById('edit-contact-form').innerHTML = editFormHtml(contactDetails.firstName, contactDetails.lastName, contactDetails.email, contactDetails.phone, contactDetails.color, contactDetails.id);;
        document.getElementById('to-edit-contact').innerHTML = `Edit contact ${contactDetails.firstName} ${contactDetails.lastName}`;
        document.getElementById('edit-contact-popup').classList.remove('d-none');
        document.getElementById('edit-contact-popup').style.display = 'block';
    } catch (error) {
        console.error('Error fetching contact details for editing:', error);
        document.getElementById('contact-details').innerHTML = '<p>Error loading contact details for editing.</p>';
    }
}

/**
 * Displays a popup for adding a new contact.
 * @returns {Promise<void>} A promise that resolves when the popup is displayed.
 */
async function addNewContact() {
    document.getElementById('add-contact-popup').classList = 'modal';
    document.getElementById('add-contact-popup').style.display = 'flex';
    document.getElementById('add-new-contact-btn').style.display = "none";
}

/**
 * Saves a new contact to the backend after collecting form data.
 * @returns {Promise<void>} A promise that resolves when the new contact is successfully saved and displayed.
 */
async function saveNewContact() {
    try {
        const getValue = id => document.getElementById(id).value.trim();
        const [firstName, lastName, email, phone, color] = ['newfirstName', 'newlastName', 'newemail', 'newphone', 'color'].map(getValue);

        if (!/^[\d\-\/\+\s]+$/.test(phone)) return setSuccessMessage('Phone number should contain only numbers, -, /, or +');

        const contactDetails = { firstName, lastName, phone, email, color };

        const apiUrl = await importConfig();
        const response = await fetchToBackend(`${apiUrl}/api/add-contact`, 'POST', JSON.stringify(contactDetails));

        if (!response.ok) throw new Error(`Fehler beim Hinzufügen des Kontakts: ${response.statusText}`);

        setSuccessMessage('Contact successfully added');
        await fetchAndDisplayContacts();

        ['newfirstName', 'newlastName', 'newphone', 'newemail'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('color').value = '#000000';
        closeEditPopup();

    } catch (error) {
        console.error('Error while adding new contact:', error);
    }
}


/**
 * Saves updates to an existing contact's details to the backend.
 * @param {string} contactId - The unique identifier for the contact being updated.
 * @returns {Promise<void>} A promise that resolves when the contact's details have been updated.
 */
async function saveContact(contactId) {
    try {
        const apiUrl = await importConfig();
        const getValue = id => document.getElementById(id).value.trim();
        const [firstName, lastName, email, phone, color] = ['firstName', 'lastName', 'email', 'phone', 'color'].map(getValue);

        if (!firstName || !lastName) return setSuccessMessage('First name and last name are required.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setSuccessMessage('Invalid email format. Please enter a valid mail address.');
        if (!/^[\d\-\/\+\s]+$/.test(phone)) return setSuccessMessage('Phone number should contain only numbers, -, /, or +');

        const updatedContact = { firstName, lastName, email, phone, color };
        const response = await fetchToBackend(`${apiUrl}/api/contact/${contactId}`, 'PUT', JSON.stringify(updatedContact));
        if (!response.ok) throw new Error('Failed to save contact');

        closeEditPopup();
        document.getElementById('contact-img-' + contactId).style.backgroundColor = color;
        await showContactDetails(contactId);
        await fetchAndDisplayContacts();

    } catch (error) {
        console.error('Error saving contact:', error);
        document.getElementById('contact-details').textContent = 'Error saving contact details.';
    }
}


/**
 * Closes the edit popup and optionally refreshes the list of displayed contacts.
 * @returns {void}
 */
function closeEditPopup() {
    document.getElementById('edit-contact-popup').classList.add('d-none');
    document.getElementById('edit-contact-popup').style.display = 'none';
    document.getElementById('add-contact-popup').classList.add('d-none');
    document.getElementById('add-contact-popup').style.display = 'none';
    document.getElementById('add-new-contact-btn').style.display = "flex";
}

/**
 * Closes the contacts detail popup.
 * @returns {void}
 */
function closeContactsPopup() {
    document.getElementById('mobile-contact-details-popup').classList = 'd-none';
    document.getElementById('mobile-contact-details-popup').style.display = 'none !important';
    document.getElementById('contact-details-modal').classList.add('d-none');
    document.getElementById('contact-details-modal').style.display = 'none !important';
    document.getElementById('save-contact') ? document.getElementById('save-contact').style.display = "none" : null;
}

/**
 * Renders the detailed view of a contact's information.
 * @param {Object} details - Detailed information about the contact.
 * @returns {void}
 */
function renderContactDetails(details) {
    document.getElementById('contact-details').innerHTML = contactDetails(details.firstName, details.lastName, details.id, details.initials, details.color, details.email, details.phone);
    document.getElementById('contactDetailsPopup').innerHTML = contactDetailsPopup(details.firstName, details.lastName, details.color, details.initials, details.email, details.phone, details.id);
}

/**
 * Provides interactive functionality for showing and hiding contact action options on mobile devices.
 * @returns {void}
 */
function showContactActions() {
    document.getElementById('mobile-action-button-options').classList.contains('d-none') ? document.getElementById('mobile-action-button-options').classList.remove('d-none') : actionButtonOptions.classList.add('d-none');
}

/**
 * Displays the delete confirmation popup for a specific task.
 * This function sets a global variable `contactToDelete` with the ID of the task that might be deleted and makes the delete confirmation popup visible.
 * @param {string} firebaseTaskId - The Firebase ID of the task to potentially delete.
 */
let contactToDelete = null;
function deleteContact(taskId) {
    contactToDelete = taskId;
    document.getElementById('deleteContactPopup').classList.remove('d-none');
    document.getElementById('deleteOverlay').classList.remove('d-none')
}

/**
 * Confirms the deletion of the task that is marked for deletion. If a task is marked for deletion (i.e., `taskToDelete` is not null), this function
 * will call `deleteTask` to perform the deletion and then reset `taskToDelete` to null. Regardless of whether a task was deleted, it will close the delete confirmation popup.
 */
function confirmDelete() {
    if (contactToDelete) {
        deleteContactFinally(contactToDelete);
        contactToDelete = null;
    }
    closeDeletePopup();
}

/**
 * Fetches and displays contacts by making an API request using a CSRF token.
 * This function retrieves the CSRF token, constructs the API endpoint using the config URL, and handles the API response by processing and displaying contacts or showing an error message.
 * @returns {Promise<void>} A promise that resolves when the contacts have been fetched and displayed, or logs an error if the fetch fails.
 */
async function deleteContactFinally(contactId) {
    try {
        let apiUrl = await importConfig();
        let response = await fetchToBackend(`${apiUrl}/api/delete/contact/${contactId}`, 'POST');
        const result = await response.json();
        if (response.ok) {
            await fetchAndDisplayContacts();
            document.getElementById('contact-details').innerHTML = '';
            setSuccessMessage('Contact successfully deleted')
        } else {
            alert(`Error deleting contact: ${result.message}`);
        }
    } catch (error) {
        console.error('Error deleting contact:', error);
    }
}

/**
 * Closes the delete confirmation popup. This function checks if the popup exists and if so, hides it along with the overlay.
 * It uses a conditional (ternary) operator to check for the existence of the popup element before attempting to modify its class list.
 */
function closeDeletePopup() {
    let popupElement = document.getElementById('deleteContactPopup');
    popupElement ? popupElement.classList.add('d-none') + document.getElementById('deleteOverlay').classList.add('d-none') : null;
}

/**
 * Renders the right side of the contact management interface.
 * @returns {void}
 */
function renderRigthSide() {
    document.getElementById('contact-main').innerHTML = templateRightSide();
}

/**
 * Returns HTML content for the right side of the contact management interface.
 * @returns {string} HTML content for the right side.
 */
function templateRightSide() {
    return /*html*/ ` 
    <div id="contact-headline" class="headline-index-contact">
        <span>Contacts</span>
        <img src="./assets/img/headline-bar.png">
        <p>Better with a team</p>
    </div>
    <div id="show-contact" class="show-contact"></div>
    <button id="add-new-contact-btn" onclick="addNewContact()" class="new-contact">
        New Contact<img src="./assets/img/user-plus.png">
    </button>

    <div id="myModal" class="modal">
        <div class="modal-content">
            <h3>Contact successfully created!</h3>
        </div>
    </div>`
}