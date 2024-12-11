import {Blip} from "./classes/requests/blip";
import {Bolklogin} from "./classes/requests/bolklogin";
import {Person} from "./classes/person";
import {URLBuilder} from "./classes/helpers/url_builder";
import {Storage} from "./classes/helpers/storage";

Storage.debug("Populating index page...");
var photo_queue = [];

function load() {
    if ( !Bolklogin.checkLoggedIn() ) return;

    Blip.getCurrentMembers((response) => {

        let persons = Person.fromArray(response);
        let personsGrid = document.getElementById("personsgrid");
        persons.forEach((person) => {

            let link = document.createElement("a");
            link.href = new URLBuilder(Storage.APP_ADDRESS)
                .path("person")
                .parameter("uid", person.uid)
                .build();
            link.innerHTML = `<img id="${person.uid}_photo" alt="${person.fullname}'s profile photo"><h4>${person.fullname}</h4>`;
            link.classList.add("person");
            personsGrid.appendChild(link);

            photo_queue.push(person.uid);
        });

        getNextPhoto();
    });
}

function getNextPhoto() {
    let uid = photo_queue.pop();
    Storage.debug(`Requesting ${uid}'s profile photo.`);

    if (uid === undefined) getNextPhoto();

    Blip.getPersonPhoto(uid, 1, 1, (response) => {
        document.getElementById(`${uid}_photo`).src = "data:image/png;base64, " + response;
        if (photo_queue.length > 0) getNextPhoto();
    });
}

load();