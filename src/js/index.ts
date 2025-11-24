import { Blip } from "./classes/api/blip";
import { Bolklogin } from "./classes/api/bolklogin";
import { URLBuilder } from "./classes/url_builder";
import { PersonController } from "./classes/person_controller";
import { ADDRESSES, Shared } from "./classes/share";
import { Person } from "./classes/person";

let photo_queue: string[] = [];

let personcontroller: PersonController;
let filter_timeout: number = 0;
let selected_uids: string[] = [];
let bulk_editing: boolean = false;

function preload() {    
    if ( !Bolklogin.is_logged_in() ) return;

    else if ( location.href.startsWith(ADDRESSES.APP_LOGOUT) ) Bolklogin.logout();

    Bolklogin.check_authorization((status, response) => {
        if (status === 200) {
            console.debug("Login is okay, loading page...");
            load();
        }
    });
};

function load() {
    if ( personcontroller === null || personcontroller === undefined ){

        console.debug("Populating index page...");
        Blip.get_all((status, response) => {

            personcontroller = PersonController.from_array(response);
            personcontroller.default_filter();
            filter();

        });
    }

    else{
        filter();
    }

    (document.getElementById("main") as HTMLAnchorElement).href = ADDRESSES.APP;
    (document.getElementById("filter_value") as HTMLInputElement).onkeydown = filter_timer;
    (document.getElementById("filter_attribute") as HTMLSelectElement).oninput = () => {
        (document.getElementById("filter_value") as HTMLInputElement).value = '';
        set_membership_filter();
    }
    (document.getElementById("export") as HTMLAnchorElement).onclick = export_persons;
    (document.getElementById("bulk_edit") as HTMLAnchorElement).onclick = start_bulk_edit;
    (document.getElementById("cancel_bulk_edit") as HTMLAnchorElement).onclick = stop_bulk_edit;

    set_membership_filter();
    
}

function set_membership_filter() {
    let input_element = document.getElementById("filter_input") as HTMLDivElement;
    const filter_element = document.getElementById("filter_attribute") as HTMLSelectElement;

    if (filter_element !== null && filter_element.value === "membership" &&
        input_element.firstElementChild?.tagName.toLowerCase() === "input") {
        input_element.innerHTML = "<select id=\"filter_value\">\n" +
            "    <option value=\"member\">Member</option>\n" +
            "    <option value=\"candidate_member\">Candidate member</option>\n" +
            "    <option value=\"former_member\">Former member</option>\n" +
            "    <option value=\"ex_member\">Ex member</option>\n" +
            "    <option value=\"donor\">Donor</option>\n" +
            "    <option value=\"honorary_member\">Honorary member</option>\n" +
            "    <option value=\"member_of_merit\">Member of merit</option>\n" +
            "    <option value=\"external\">External</option>\n" +
            "  </select>";
        (input_element.firstElementChild as HTMLInputElement).oninput = filter;

    } else if (input_element.firstElementChild?.tagName.toLowerCase() === "select") {
        input_element.innerHTML = "<input type=\"text\" id=\"filter_value\">";
        (input_element.firstElementChild as HTMLInputElement).onkeydown = filter_timer;
    }
}

function filter_timer() {
    if (filter_timeout !== undefined && filter_timeout !== null) {
        clearTimeout(filter_timeout);
    }
    filter_timeout = setTimeout(filter, 500);
}

function filter(){
    let attribute = (document.getElementById('filter_attribute') as HTMLSelectElement).value;
    let filter_string = (document.getElementById('filter_value') as HTMLInputElement).value;

    if (filter_string !== undefined &&
        filter_string !== null &&
        filter_string.length !== 0) personcontroller.filter(attribute, filter_string);
    else personcontroller.default_filter();

    load_persongrid();
}

function onclick_person(event: MouseEvent) {
    if (event.target === undefined || event.target === null || !(event.target instanceof HTMLElement)) return;
    
    let person = document.getElementById(event.target.id.replace("_photo", ""));

    if (bulk_editing && person !== null && person !== undefined && person instanceof HTMLAnchorElement) {
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
        (document.getElementById("confirm_bulk_edit_p") as HTMLParagraphElement).innerHTML = innerHTML;

        (document.getElementById("confirm_bulk_edit") as HTMLAnchorElement).href = new URLBuilder("")
            .path("person")
            .parameter("bulk_edit", selected_uids.join(","))
            .build();
        return false;
    }
}

function load_persongrid(){
    Shared.change_element("personsgrid", HTMLDivElement, (personsgrid) => {
        personsgrid.innerHTML = "";
        photo_queue = [];

        let persons = personcontroller.get_displayed();
        for (let person of persons) {
            if (person.uid === undefined || !(person instanceof Person)) continue;

            let link = document.createElement("a");
            link.href = new URLBuilder("")
                .path("person")
                .parameter("uid", person.uid)
                .build();

            link.id = person.uid;
            link.onclick = onclick_person;
            
            let src_photo: string | Blob = Shared.BROKEN_IMAGE;
            if (person.has_photo()) src_photo = person.get_photo();
            else photo_queue.push(person.uid);
            
            link.innerHTML = `<img id="${person.uid}_photo" alt="${person.name}'s profile photo" src=${src_photo}><h4>${person.name}</h4>`;
            link.classList.add("person");
            personsgrid.appendChild(link);
        }
     
        Shared.change_element("users_num", HTMLParagraphElement, (e) => {
            if (persons.length === 1) e.innerHTML = "Export 1 user";
            else e.innerHTML = `Export ${persons.length} users`;
        });
    });

    if (photo_queue.length > 0) {
        photo_queue = photo_queue.reverse();
        Blip.get_multiple_photos(photo_queue, (status, response: {[key: string]: string}) => {
            if (status == 200) {
                
                for (const uid in response) {
                    Shared.change_element(`${uid}_photo`, HTMLImageElement, (e) => {
                        e.src = `data:image/jpeg;base64,${response[uid]}`;
                        const index = photo_queue.indexOf(uid);
                        personcontroller.get_person(uid)?.set_photo(e.src);
                        photo_queue.splice(index, 1);
                    });
                }

            }
            getNextPhoto();
        });
    }
}

function getNextPhoto() {
    if (photo_queue.length <= 0){
        return;
    }

    let uid = photo_queue.pop();
    if (uid === undefined) {
        getNextPhoto();
        return;
    }

    console.debug(`Requesting ${uid}'s profile photo.`);
    let person = personcontroller.get_person(uid);

    if (person === undefined) {
        getNextPhoto();
        return;
    }

    person.fetch_photo((status, response) => {
        if (status === 200) {
            let e = document.getElementById(`${uid}_photo`);
            if (e === null || !(e instanceof HTMLImageElement)) {
                getNextPhoto();
                return;
            }
            e.src = response;
            if (photo_queue.length > 0) getNextPhoto();
        }
    });
}

function start_bulk_edit() {
    bulk_editing = true;

    for (const element of ["new_member", "bulk_edit", "filter_input", "filter_attribute", "export"]) {
        Shared.change_element(element, HTMLElement, (e) => {
            e.style.display = "none";
        });
    }

    for (const element of ["confirm_bulk_edit", "cancel_bulk_edit"]) {
        Shared.change_element(element, HTMLElement, (e) => {
            e.style.display = "";
        });
    }
}

function stop_bulk_edit() {
    bulk_editing = false;

    for (const element of ["new_member", "bulk_edit", "filter_input", "filter_attribute", "export"]) {
        Shared.change_element(element, HTMLElement, (e) => {
            e.style.display = "";
        });
    }

    for (const element of ["confirm_bulk_edit", "cancel_bulk_edit"]) {
        Shared.change_element(element, HTMLElement, (e) => {
            e.style.display = "";
        });
    }

    for (const element of selected_uids) {
        Shared.change_element(element, HTMLElement, (e) => {
            e.classList.remove("selected");
        });
    }
    
    selected_uids = [];
}

function export_persons() {
    let csv = personcontroller.to_csv();
    const blob = new File([csv], 'export.csv', {type: 'text/csv;charset=utf-8,'})
    const obj_url = URL.createObjectURL(blob);
    location.replace(obj_url);
}

preload();
