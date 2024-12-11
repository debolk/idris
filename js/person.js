import {Person} from "./classes/person";
import {Blip} from "./classes/requests/blip";
import {Storage} from "./classes/helpers/storage";

Blip.debug("Populating person page...");
let gperson;

function load() {

    let params = new URLSearchParams(location.search);
    let person = params.get("uid");
    Storage.debug("Loading " + person);
    Blip.getPerson(person, (response) => {
        Storage.debug(response);
        gperson = new Person(response);
        populatePage(gperson);
    });

    document.getElementById("edit").onclick = edit;
    document.getElementById("save").onclick = save;
}

function populatePage(person) {
    for (let attribute in person.available_attributes) {
        let element = document.getElementById(attribute);
        element.innerHTML = parseAttribute(attribute, person.get(attribute));
    }
}

function parseAttribute(attribute, value) {
    if (value === undefined) {
        return "";

    } else if (value.constructor === Array) {
        return value.join("<br>");

    } else if (value === true) {
        return "yes";

    } else if (value === false) {
        return "no";

    } else if (typeof(value) === "string" && value.includes("\n")) {
        return value.replaceAll("\n", "<br>").replaceAll("_", " ");

    }
    return value.replaceAll("_", " ");
}

export function edit() {
    //let person = Blip.getVariable("bolk-person");
    for (let attribute in gperson.available_attributes) {
        let type = gperson.available_attributes[attribute];

        let old = document.getElementById(attribute);
        let parent = old.parentNode;

        let e = document.createElement("input")
        e.value = old.innerHTML;

        if (type === "string"){
            e.type = "text";

        } else if (type === "date") {
            e.type = "date";

        } else if (type === "multiline_string") {
            e = document.createElement("textarea");
            e.innerHTML = old.innerHTML.replaceAll("<br>", "\n");

        } else if (type === "phone_number") {
            e.type = "tel";

        } else if (type === "bool") {
            e.type = "checkbox";
            e.checkbox = e.value === "yes";

        } else if (type === "options") {
            if (attribute === "membership") {
                e = document.createElement("select");
                e.required = true;
                let select;
                let index = 0;
                ["member", "candidate_member", "former_member", "ex_member",
                    "donor", "honorary_member", "member_of_merit", "external"].forEach((v) => {
                    let option = document.createElement("option");
                    let display = v.replaceAll("_", " ");
                    if (display === e.innerHTML) select = index;
                    option.value = v;
                    option.innerHTML = display;
                    e.options.add(option);
                    index ++;
                })
                e.options.selectedIndex = select;
            }
        }
        e.id = attribute;

        parent.replaceChild(e, old);

        old.remove();
    }
}

function save() {
    let changed = {};
    for (let attribute in gperson.available_attributes) {
        let type = gperson.available_attributes[attribute];

        let old = document.getElementById(attribute);
        let value = old.value;


        if (type === "multiline_string") {
            value = old.innerHTML;

            if (attribute !== "address") {
                if (gperson[attribute] !== value &&
                    gperson[attribute].join("\n") !== value) changed[attribute] = value.split("\n");
                continue;
            }

        } else if (type === "phone_number") {
            //TODO TEST IF VALID PHONENUMBER

        } else if (type === "options") {
            value = old.options.item(old.options.selectedIndex).value;
        } else if (type === "bool") {
            gperson[attribute] = gperson[attribute] === "yes";
            value = old.checked;
        }

        if (value === "") value = undefined;

        if (gperson[attribute] !== value) {
            changed[attribute] = value;
        }
    }
    if (Object.keys(changed).length > 0) Blip.patchPerson(gperson["uid"], JSON.stringify(changed));
    //location.reload()
}

load();