import {Person} from "/js/classes/person.js";
import {Bolklogin} from "/js/classes/requests/bolklogin.js";
import {Blip} from "/js/classes/requests/blip.js";
import {Storage} from "/js/classes/helpers/storage.js";


/**
 * @type {Person}
 */
let person_object = [];
let timeout;

const placeholders = {"firstname": "First name", "surname": "Surname", "phone": "Phone number", "email": "Email address", "phone_emergency": "Emergency contact"}

function preload() {
    if ( !Bolklogin.checkLoggedIn() ) return;

    Bolklogin.checkAuthorization((status, response) => {
        if (status === 200) {
            console.debug("Login is okay, loading page...");
            load();
        } else {
            Storage.display_error("You are not authorized to access this page.");
        }
    });
}

function load(){
    if (location.search === "?new") {
        person_object = Person.fromEmpty();
        populatePage(person_object);
        document.getElementById("delete").style.display = "none";
        document.getElementById("passreset").style.display = "none";
        edit();

    } else if (location.search.startsWith("?uid")) {
        load_person();
    } else if (location.search.startsWith("?bulk_edit")) {
        load_person_bulk();
    }

    document.getElementById("main").href = Storage.APP_ADDRESS;

    document.getElementById("edit").onclick = edit;
    document.getElementById("save").onclick = (e) => {
        if (Array.isArray(person_object)) {
            bulk_save(person_object);
        } else {
            save(person_object)
        }
    };
    document.getElementById("delete").onclick = delete_person;
    document.getElementById("passreset").onclick = reset_password;
}

function load_person() {
    console.debug("Populating person page...");

    let params = new URLSearchParams(location.search);
    let person = params.get("uid");

    if (person === undefined || person === null || person === "") {
        Storage.display_error("No person specified");
        return;
    }

    console.debug("Loading " + person);

    Blip.getPerson(person, (response) => {
        person_object = Person.fromArray(response);
        populatePage(person_object);
    });
}

function load_person_bulk() {
    console.debug("Populating person page...");
    
    let params = new URLSearchParams(location.search);
    let uids = params.get("bulk_edit").split(',');

    if (uids.length === 0) {
        Storage.display_error("No users specified");
        return;
    } else if (uids.length === 1) {
        Blip.getPerson(uids[0], (response) => {
            person_object = Person.fromArray(response);
            populatePage(person_object);
        });
        return;
    }

    Storage.display_message(`Loading ${uids.length} users...`);

    fetchBulkPersons(uids);
}

function fetchBulkPersons(uids) {
   
    if (Array.isArray(uids) && uids.length > 0) {
        let uid = uids[0];
        Blip.getPerson(uid, (response) => {
            person_object.push(Person.fromArray(response));
            uids.shift();
            fetchBulkPersons(uids);
        });
    } else if (uids.length === 0) {
        populatePageBulk();
    }
}

function populatePageBulk(uid_length) {
    Storage.remove_message();

    let names = [];

    for (let person of person_object) {
        populatePage(person);
        names.push(person.get("name"));
    }

    console.debug(names);
    document.getElementById("name_row").innerHTML = `<p>${names.join("<br>")}</p>`;
    
    for (let element of ["uid_row", "profile_picture", "delete", "passreset"]) {
        document.getElementById(element).remove();
    }
}

function mergeElement(element_id, new_element) {
    let element = document.getElementById(element_id);
    
    if (element.href !== new_element.href) { //if new and old do not match, don't have a link.
        element.href = "";
    }

    if (element.innerHTML !== new_element.innerHTML) { //if new and old do not match, display multiple values;
        element.innerHTML = "(multiple values)";
        element.classList.add("multiple_values");
    }
}

function populatePage(person) {
    for (let attribute of Person.available_attributes.keys()) {

        let element = document.getElementById(attribute).cloneNode(true);
        element.innerHTML = parseAttribute(person.get(attribute));

        if (attribute === "phone") {
            element.href = "tel:" + element.innerHTML;

        } else if (attribute === "phone_emergency") {
            let inner = [];
            for (let number of element.innerHTML.split("<br>")) {
                inner.push(`<a href="tel:${number}">${number}</a>`);
            }
            element.innerHTML = inner.join("<br>");
            
        } else if (attribute === "email") {
            element.href = "mailto:" + element.innerHTML;
        }

        if (Array.isArray(person_object) && person.uid() !== person_object[0].uid()) {
            mergeElement(attribute, element);
        } else {
            document.getElementById(attribute).replaceWith(element);
        }
    }
    
    if (!Array.isArray(person_object)) {
        let element = document.getElementById("uid");
        element.innerHTML = person.uid();

        setPhoto();
    }
}

function setPhoto() {
    person_object.fetchPhoto((photo) => {
        let element = document.getElementById("profile_picture");

        if (element === null) return;
        else {
            element.src = photo;
        }
    });
}

function parseAttribute(value) {
    if (value === undefined) {
        return "";

    } else if (value.constructor === Array) {
        return value.join("<br>");

    } else if (value === true) {
        return "yes";

    } else if (value === false) {
        return "no";

    } else if (typeof(value) === "string" && value.includes("\n")) {
        return value.replaceAll("\n", "<br>");
    } else if (typeof(value) === "string" && value.includes("_")) {
        return value.replace("_", " ");
    }
    return value;
}

function edit() {
     
    for (let entry of Person.available_attributes.entries()) {
        let attribute = entry[0]
        let type = entry[1]

        let old = document.getElementById(attribute);
        if (old === null || old === undefined) {
            continue;
        }

        let parent = old.parentNode;

        let e = document.createElement("input")
        e.value = old.innerHTML;

        if (old.classList.contains("multiple_values")) {
            e.classList.add("multiple_values");
        }

        if (attribute in placeholders){
            e.placeholder = placeholders[attribute];
        }

        if (type === "string"){
            e.type = "text";

        } else if (type === "date") {
            e.type = "date";

        } else if (type === "multiline_string") {
            e = document.createElement("textarea");
            if (old.classList.contains("multiple_values")) {
                e.classList.add("multiple_values");
            }

            e.innerHTML = old.innerHTML.replaceAll("<br>", "\n");

            if (e.innerHTML.includes("href")) {
                let inner_new = [];
                for (let inner of old.children) {
                    if (inner.innerHTML != "") {
                        inner_new.push(inner.innerHTML);
                    }
                }
                console.debug(inner_new);
                e.innerHTML = inner_new.join('\n');
            }

        } else if (type === "phone_number") {
            e.type = "tel";

        } else if (type === "bool") {
            e.type = "checkbox";
            e.checked = old.innerHTML === "yes";

        } else if (type === "options") {
            if (attribute === "membership") {
                e = document.createElement("select");
                if (old.classList.contains("multiple_values")) {
                    e.classList.add("multiple_values");
                }

                e.required = true;
                let select;
                let index = 0;
                ["member", "candidate_member", "former_member", "ex_member",
                    "donor", "honorary_member", "member_of_merit", "external"].forEach((v) => {
                    let option = document.createElement("option");
                    let display = v.replaceAll("_", " ");

                    if (v === old.innerHTML) select = index;
                    option.value = v;
                    option.innerHTML = display;
                    e.options.add(option);
                    index ++;
                })
                e.options.selectedIndex = select;
            }
        }
        e.id = attribute;
        e.oninput = (event) => {
            e.classList.add("changed");
        };

        parent.replaceChild(e, old);

        old.remove();
    }
}

function bulk_save(object_array, index = 0) {
    if (index < object_array.length && index >= 0) {
        save(object_array[index], (o) => {
            Storage.display_message(`Successfully saved for ${object_array[index].get("name")}`);
            bulk_save(object_array, index + 1);
        });
        return;
    }
    alert("Saved bulk changes");
    location.reload();
}

function save(person_object, save_callback = null) {
    console.debug(`Attempting to save ${person_object.uid()}`);
    for (let entry of Person.available_attributes.entries()) {
        let attribute = entry[0];
        let type = entry[1];

        let old = document.getElementById(attribute);
        if (old === null || old === undefined || 
            (old.classList.contains("multiple_values") && !old.classList.contains("changed"))) {
            console.debug(`Skipping ${attribute}`);
            continue;
        }
        
        let value = old.value;

        let person_attr = person_object.get(attribute);

        if (value === "") value = null;

        if (person_attr === undefined && value === null) {
            console.debug(`Skipping ${attribute}`);
            continue;
        } else if (value === null) {
            person_object.set(attribute, value);
            continue;
        }

        if (["firstname", "surname", "nickname"].includes(attribute) && value !== null && value !== undefined && value.split(" ").length === 1) {
            
            value = value.replace(/^\w/, c => c.toUpperCase()); //capitalize strings

        } else if (type === "multiline_string") {

            if (attribute !== "address" && attribute !== "phone_emergency") {

                if ((typeof person_attr === "string" && person_attr !== value) ||
                    (Array.isArray(person_attr) && person_attr.join('\n') !== value) ||
                    person_attr === undefined) {
                    person_object.set(attribute, value.split('\n'));
                } 
                continue;

            } else if (attribute === "phone_emergency") {
                
                if ((typeof person_attr === "string" && person_attr !== value) || 
                    (Array.isArray(person_attr) && person_attr.join('\n') !== value) ||
                    person_attr === undefined) {
                        value = value.replace("\n\n", "\n");
                        person_object.set(attribute, value.split('\n'));
                }
                continue;
            }
        } else if (type === "options") {
            value = old.options.item(old.options.selectedIndex).value;

        } else if (type === "bool") {
            value = old.checked;

        } 

        if (person_attr !== value || person_object.uid() === undefined) { //always force save new user attributes
            person_object.set(attribute, value);
        } else {
            console.debug(`Skipping ${attribute}`);
        }
    }
    person_object.save(save_callback);
}

function delete_person() {
    Bolklogin.checkAuthorization((status, response) => {
        if (status === 200) {
            if (confirm("Do you want to delete " + person_object.get("name"))) {
                if (!confirm("Select the CANCEL button if you're sure.")){
                    Blip.deletePerson(person_object.uid(), (s, r) => {
                        if (s === 200) {
                            alert("Successfully deleted " + person_object.get("name"));
                            location.replace(Storage.APP_ADDRESS);
                        } else{
                            Storage.display_error(r);
                        }
                    });
                }
            }
        } else {
            Storage.display_error("You are not authorized to do this.");
        }
    });
}

function reset_password() {
    Blip.patchResetPassword(person_object.uid(), (status, response) => {
        if (status === 200) {
            alert("Password reset successfully and mail sent.");
        } else {
            Storage.display_error("Server was not able to reset the password.");
        }
    });
}

preload();