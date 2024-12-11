import {Blip} from "./classes/requests/blip";
import {Bolklogin} from "./classes/requests/bolklogin";
import {Person} from "./classes/person";
import {URLBuilder} from "./classes/helpers/url_builder";
import {Storage} from "./classes/helpers/storage";

Storage.debug("Populating index page...");

function load() {
    if ( !Bolklogin.checkLoggedIn() ) return;
    else document.getElementById('content').innerHTML = "Welcome, you are logged in.";

    Blip.getCurrentMembers((response) => {

        let persons = Person.fromArray(response);
        let personsGrid = document.getElementById("personsgrid");
        persons.forEach((person) => {

            let link = document.createElement("a");
            link.href = new URLBuilder(Storage.APP_ADDRESS)
                .path("person")
                .parameter("uid", person.uid)
                .build();
            link.innerHTML = "<h4>" + person.fullname + "</h4>";

            personsGrid.appendChild(link);
        });

    });
}

load();