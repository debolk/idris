import {Blip} from "/js/classes/requests/blip.js";
import {Bolklogin} from "/js/classes/requests/bolklogin.js";
import {URLBuilder} from "/js/classes/helpers/url_builder.js";
import {Storage} from "/js/classes/helpers/storage.js";
import {PersonController} from "/js/classes/persons_controller.js";

let photo_queue = [];

/**
 * @type {PersonController}
 */
let personcontroller;
let filter_timeout;
let selected_uids = [];
let bulk_editing = false;

function preload() {
    console.debug(Storage.APP_REDIRECT_ADDRESS);
    if ( !Bolklogin.checkLoggedIn() ) return;

    else if ( location.href.startsWith(Storage.APP_LOGOUT_ADDRESS) ) Bolklogin.logout();

    Bolklogin.checkAuthorization((status, response) => {
        if (status === 200) {
            console.debug("Login is okay, loading page...");
            load();
        }
    });
};

function load() {
    if ( personcontroller === null || personcontroller === undefined ){

        console.debug("Populating index page...");
        Blip.getAll((response) => {

            personcontroller = PersonController.fromArray(response);
            personcontroller.default_filter();
            filter();

        });
    }

    else{
        filter();
    }

    document.getElementById("main").href = Storage.APP_ADDRESS;

    document.getElementById('filter_value').onkeydown = filter_timer;
    set_membership_filter();

    document.getElementById('filter_attribute').oninput = () => {
        document.getElementById('filter_value').value = '';
        set_membership_filter();
    };

    document.getElementById('export').onclick = export_persons;

    document.getElementById('bulk_edit').onclick = startBulkEdit;

    document.getElementById('cancel_bulk_edit').onclick = stopBulkEdit;
    
}

function set_membership_filter() {
    let input_element = document.getElementById('filter_input');

    if (document.getElementById('filter_attribute').value === "membership" &&
        input_element.children.item(0).tagName.toLowerCase() === "input") {
        input_element.innerHTML = "<select id=\"filter_value\">\n" +
            "    <option value=\"member\">Member</option>\n" +
            "    <option value=\"candidate_member\">Candidate member</option>\n" +
            "    <option value=\"former_member\">Former member</option>\n" +
            "    <option value=\"ex_member\">Ex member</option>\n" +
            "    <option value=\"donor\">Donor</option>\n" +
            "    <option value=\"honorary_member\">Honorary member</option>\n" +
            "    <option value=\"member_of_merit\">Member of merit</option>\n" +
            "    <option value=\"external\">External</option>\n" +
            "  </select>"
        input_element.children.item(0).oninput = filter;

    } else if (input_element.children.item(0).tagName.toLowerCase() === "select") {
        input_element.innerHTML = "<input type=\"text\" id=\"filter_value\">"
        input_element.children.item(0).onkeydown = filter_timer;
    }
}

function filter_timer() {
    if (filter_timeout !== undefined && filter_timeout !== null) {
        clearTimeout(filter_timeout);
    }
    filter_timeout = setTimeout(filter, 500);
}

function filter(){
    let attribute = document.getElementById('filter_attribute').value;
    let filter_string = document.getElementById('filter_value').value;

    if (filter_string !== undefined &&
        filter_string !== null &&
        filter_string.length !== 0) personcontroller.filter(attribute, filter_string);
    else personcontroller.default_filter();

    loadPersons();
}

function onclickPerson(event) {
    let person = document.getElementById(event.target.id.replace("_photo", ""));
    if (bulk_editing === true) {
        if (person.classList.contains("selected")) {
            person.classList.remove("selected");
            selected_uids = selected_uids.join(" ").replaceAll(person.id, "").replaceAll("  ", " ").trim().split(" ");
            if (selected_uids.length === 1 && selected_uids[0] === "") {
                selected_uids = [];
            }
        } else {
            person.classList.add("selected");
            selected_uids.push(person.id);
        }
        let innerHTML = `Edit ${selected_uids.length} users`;
        if (selected_uids.length === 0) {
            innerHTML = "Edit 0 users";
        }
        document.getElementById("confirm_bulk_edit_p").innerHTML = innerHTML;

        document.getElementById("confirm_bulk_edit").href = new URLBuilder("")
            .path("person")
            .parameter("bulk_edit", selected_uids.join(","))
            .build();
        return false;
    }
}

function loadPersons(){
    let personsGrid = document.getElementById("personsgrid");
    personsGrid.innerHTML = "";
    photo_queue = [];

    let persons = personcontroller.getDisplayedPersons();
    for (let person of persons) {

        let link = document.createElement("a");
        link.href = new URLBuilder("")
            .path("person")
            .parameter("uid", person.uid())
            .build();

        link.id = person.uid();
        link.onclick = onclickPerson;
        
        let src_photo = Storage.BROKEN_IMAGE;
        if (person.hasPhoto()) src_photo = person.getPhoto();
        else photo_queue.push(person.uid());
        
        link.innerHTML = `<img id="${person.uid()}_photo" alt="${person.get("name")}'s profile photo" src=${src_photo}><h4>${person.get("name")}</h4>`;
        link.classList.add("person");
        personsGrid.appendChild(link);
    }

    if (photo_queue.length > 0) {
        photo_queue = photo_queue.reverse();
        Blip.getPhotos(photo_queue, (status, response) => {
            if (status == 200) {
                let json = JSON.parse(response);
                for (let uid in json) {
                    let element = document.getElementById(`${uid}_photo`);
                    if (element === null) continue;
                    else {
                        element.src = `data:image/jpeg;base64,${json[uid]}`;
                    }
                    let index = photo_queue.indexOf(uid);
                    personcontroller.get_person(uid).setPhoto(element.src);
                    photo_queue.splice(index, 1);
                }
            }
            getNextPhoto();
        });
    }
 
    if (persons.length === 1) {
        document.getElementById("users_num").innerHTML = 'Export 1 user';
    } else {
        document.getElementById("users_num").innerHTML = `Export ${persons.length} users`;
    }

}

function getNextPhoto() {
    if (photo_queue.length <= 0){
        return;
    }

    let uid = photo_queue.pop();
    if (uid === undefined) getNextPhoto();

    console.debug(`Requesting ${uid}'s profile photo.`);
    let person = personcontroller.get_person(uid);

    person.fetchPhoto((response) => {
        if (document.getElementById(`${uid}_photo`) === null) {
            getNextPhoto();
            return;
        }
        document.getElementById(`${uid}_photo`).src = response;
        if (photo_queue.length > 0) getNextPhoto();
    })
}

function startBulkEdit() {
    bulk_editing = true;

    for (let element of ["new_member", "bulk_edit", "filter_input", "filter_attribute", "export"]) {
        document.getElementById(element).style.display = "none";
    }

    document.getElementById("confirm_bulk_edit").style.display = "";
    document.getElementById("cancel_bulk_edit").style.display = "";
}

function stopBulkEdit() {
    bulk_editing = false;

    for (let element of ["new_member", "bulk_edit", "filter_input", "filter_attribute", "export"]) {
        document.getElementById(element).style.display = "";
    }

    document.getElementById("confirm_bulk_edit").style.display = "none";
    document.getElementById("cancel_bulk_edit").style.display = "none";

    for (let element of selected_uids) {
        document.getElementById(element).classList.remove("selected");
    }
    selected_uids = [];
}

function export_persons() {
    let csv = personcontroller.toCSV();
    const blob = new File([csv], 'export.csv', {type: 'text/csv;charset=utf-8,'})
    const obj_url = URL.createObjectURL(blob);
    location.replace(obj_url);
}

preload();
