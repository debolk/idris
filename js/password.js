import {Bolklogin} from "./classes/requests/bolklogin";
import {Storage} from "./classes/helpers/storage";
import {Blip} from "./classes/requests/blip";
import {Person} from "./classes/person";

/**
 * @type {Person}
 */
let person_object;

function load() {
    if ( !Bolklogin.checkLoggedIn() ) return;

    let person = Storage.getVariable(Storage.STORAGE.USER_ID);

    if (person === undefined || person === null || person === "") {
        Storage.display_error("No person specified");
        return;
    }

    console.debug("Loading " + person);

    Blip.getPerson(person, (response) => {
        person_object = Person.fromArray(response);
    });

    document.getElementById("submit").onclick = submit;

}

function submit(){
    if (person_object === null || person_object === undefined) {
        console.error("No person loaded");
        return;
    }

    let old_pass = document.getElementById("old_password").value;
    let new_pass = document.getElementById("new_password").value;
    let new_pass_confirm = document.getElementById("new_password_confirm").value;

    if (new_pass !== new_pass_confirm) {
        Storage.display_error("New passwords don't match");
        return;
    } else if (old_pass.length === 0 || new_pass.length === 0 || new_pass_confirm.length === 0) {
        Storage.display_error("Password cannot be empty");
        return;
    }

    Blip.patchPassword(person_object.uid(), JSON.stringify({"old_password": old_pass, "new_password": new_pass}), (s, r) => {
       if (s === 200) {
            document.getElementById("header").innerHTML = "Password changed successfully";
       } else {
           if (r === "Server is unwilling to perform") {
               Storage.display_error("Wrong password");
           } else {
               Storage.display_error(r);
           }

       }
    });
}

load();