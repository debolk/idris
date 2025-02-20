import {Person} from "./classes/person";
import {Blip} from "./classes/requests/blip";
import {Storage} from "./classes/helpers/storage";

/**
 * @type {Person}
 */
let person_object;

function load() {

    console.debug("Populating person page...");

    let params = new URLSearchParams(location.search);
    let person = params.get("uid");

    console.debug("Loading " + person);

    Blip.getPerson(person, (response) => {
        person_object = new Person(response);
        populatePage(person_object);
    });

    document.getElementById("edit").onclick = edit;
    document.getElementById("save").onclick = save;
}

function populatePage(person) {
    for (let attribute of Person.available_attributes.keys()) {
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
    for (let entry of Person.available_attributes.entries()) {
        let attribute = entry[0]
        let type = entry[1]

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
    for (let entry of Person.available_attributes.entries()) {
        let attribute = entry[0];
        let type = entry[1];

        let old = document.getElementById(attribute);
        let value = old.value;

        let person_attr = person_object.get(attribute);

        if (value === "") value = undefined;

        if (person_attr === undefined && value === undefined) {
            continue;
        }

        if (type === "multiline_string") {
            value = old.innerHTML;

            if (attribute !== "address") {
                if (person_attr !== undefined &&
                    person_attr !== value &&
                    person_attr.join("\n") !== value)
                    person_object.set(attribute, value.split('\n'));
                continue;
            }

        } else if (type === "phone_number") {
            //TODO TEST IF VALID PHONENUMBER

        } else if (type === "options") {
            value = old.options.item(old.options.selectedIndex).value;

        } else if (type === "bool") {
            value = old.checked;
        }


        if (person_attr !== value) {
            person_object.set(attribute, value);
        }
    }
    person_object.save();
    // location.reload()
}

load();
