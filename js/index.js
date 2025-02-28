import {Blip} from "./classes/requests/blip";
import {Bolklogin} from "./classes/requests/bolklogin";
import {Person} from "./classes/person";
import {URLBuilder} from "./classes/helpers/url_builder";
import {Storage} from "./classes/helpers/storage";

let photo_queue = [];

/**
 * @type {PersonController}
 */
let personcontroller;
let filter_timeout;

function preload() {
    if ( !Bolklogin.checkLoggedIn() ) return;

    Bolklogin.checkAuthorization((status, response) => {
        console.debug("TEST");
        if (status === 200) {
            console.debug("Login is okay, loading page...");
            load();
        } else {
            Storage.display_error("You are not authorized to access this page.");
        }
    });
};

function load() {
    if ( personcontroller === null || personcontroller === undefined ){

        console.debug("Populating index page...");
        Blip.getAll((response) => {

            personcontroller = Person.fromArray(response);
            personcontroller.default_filter();
            filter();

        });
    }

    else{
        filter();
    }

    document.getElementById('filter_value').onkeydown = filter_timer;
    set_membership_filter();

    document.getElementById('filter_attribute').oninput = () => {
        document.getElementById('filter_value').value = '';
        set_membership_filter();
    };
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

function loadPersons(){
    let personsGrid = document.getElementById("personsgrid");
    personsGrid.innerHTML = "";
    photo_queue = [];

    let persons = personcontroller.getDisplayedPersons();
    for (let person of persons) {

        let link = document.createElement("a");
        link.href = new URLBuilder(Storage.APP_ADDRESS)
            .path("person")
            .parameter("uid", person.uid())
            .build();
        link.innerHTML = `<img id="${person.uid()}_photo" alt="${person.get("name")}'s profile photo"><h4>${person.get("name")}</h4>`;
        link.classList.add("person");
        personsGrid.appendChild(link);

        photo_queue.push(person.uid());
    }
    photo_queue = photo_queue.reverse();

    getNextPhoto();
}

function getNextPhoto() {
    if (photo_queue.length === 0){
        return;
    }

    let uid = photo_queue.pop();
    if (uid === undefined) getNextPhoto();

    console.debug(`Requesting ${uid}'s profile photo.`);
    let person = personcontroller.get_person(uid);

    person.getPhoto((response) => {
        if (document.getElementById(`${uid}_photo`) === null) {
            getNextPhoto();
            return;
        }
        document.getElementById(`${uid}_photo`).src = "data:image/png;base64, " + response;
        if (photo_queue.length > 0) getNextPhoto();
    })
}

preload();
