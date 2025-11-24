import { Person } from "./classes/person";
import { Bolklogin } from "./classes/api/bolklogin";
import { Blip } from "./classes/api/blip";
import { ADDRESSES, Shared } from "./classes/share";
import { Callback } from "./classes/api/request";

let persons_array: Person[] = [];
let timeout: number;

const placeholders = new Map([
    ["firstname", "First name"],
    ["surname", "Surname"],
    ["phone", "Phone number"],
    ["email", "Email address"],
    ["phone_emergency", "Emergency contact"]]);

function preload() {
    if ( !Bolklogin.is_logged_in() ) return;

    Bolklogin.check_authorization((status, response) => {
        if (status === 200) {
            console.debug("Login is okay, loading page...");
            load();
        } else {
            Shared.display_error("You are not authorized to access this page.");
        }
    });
}

function bulk_editing(): boolean {
    return persons_array.length > 1;
}

function load(){
    if (location.search === "?new") {
        persons_array = [Person.from_empty()];
        
        populate_page(persons_array[0]); 
        for (const element of ["delete", "passreset"]) {
            Shared.change_element(element, HTMLElement, (e) => {
                e.style.display = "none";
            })
        }
        edit();

    } else if (location.search.startsWith("?uid")) {
        load_person();
    } else if (location.search.startsWith("?bulk_edit")) {
        load_person_bulk();
    }

    Shared.change_element("main", HTMLAnchorElement, (e) => {
        e.href = ADDRESSES.APP;
    });

    Shared.change_element("edit", HTMLButtonElement, (e) => {
        e.onclick = edit;
    });

    Shared.change_element("cancel", HTMLButtonElement, (e) => {
        e.onclick = () => {
            location.reload();
        };
    });

    Shared.change_element("save", HTMLButtonElement, (e) => {
        e.onclick = (e) => {
            if (bulk_editing()) bulk_save(persons_array);
            else save(persons_array[0]);
        };
    });

    Shared.change_element("delete", HTMLButtonElement, (e) => {
        e.onclick = delete_person;
    });
    
    Shared.change_element("passreset", HTMLButtonElement, (e) => {
        e.onclick = reset_password;
    });
}

function load_person() {
    console.debug("Populating person page...");

    let params = new URLSearchParams(location.search);
    let uid = params.get("uid");

    if (uid === undefined || uid === null || uid === "") {
        Shared.display_error("No person specified");
        return;
    }

    console.debug("Loading " + uid);

    fetch_person(uid)
}

function load_person_bulk() {
    console.debug("Populating person page...");
    
    let params = new URLSearchParams(location.search);
    let uids: string | string[] | null = params.get("bulk_edit");

    if (uids === null || uids === undefined) {
        Shared.display_error("No users specified");
        return;
    }
    uids = uids.split(',');

    if (uids.length === 0) {
        Shared.display_error("No users specified");
        return;
    } else if (uids.length === 1) {
        fetch_person(uids[0]);
        return;
    }

    Shared.display_message(`Loading ${uids.length} users...`);

    fetch_person_bulk(uids);
}

function fetch_person(uid: string) {
    Blip.get_person(uid, (status, response) => {
        if (status === 200) {
            persons_array = [Person.from_json(response)];
            populate_page(persons_array[0]);
        } else {
            Shared.display_error(`Error: ${status} - ${response}`);
        }
    });
} 

function fetch_person_bulk(uids: string[]) {
   
    if (uids.length > 0) {
        let uid = uids[0];
        Blip.get_person(uid, (status, response) => {
            if (status === 200) {
                persons_array.push(Person.from_json(response));
                uids.shift();
                fetch_person_bulk(uids);
            } else {
                Shared.display_error(`Could not load persons, error with: ${uid}`);
            }
        })
    } else {
        populate_page_bulk();
    }
}

function populate_page_bulk() {
    Shared.remove_message();

    let names: string[] = [];

    for (let person of persons_array) {
        populate_page(person);
        if (person.name !== undefined) {
            names.push(person.name);
        }
    }

    Shared.change_element("name_row", HTMLElement, (e) => {
        e.innerHTML = `<p>${names.join("<br>")}</p>`;
    });
    
    for (let element of ["uid_row", "profile_picture", "delete", "passreset"]) {
        Shared.change_element(element, HTMLElement, (e) => {
            e.remove();
        });
    }
}

function merge_elements(element_id: string, new_element: HTMLElement) {
    let element = document.getElementById(element_id);
    
    if (element === null) return;

    if ((element instanceof HTMLAnchorElement && new_element instanceof HTMLAnchorElement)
         && element.href !== new_element.href) { //if new and old do not match, don't have a link.
        element.href = "";
    }

    if (element.innerHTML !== new_element.innerHTML) { //if new and old do not match, display multiple values;
        element.innerHTML = "(multiple values)";
        element.classList.add("multiple_values");
    }
}

function populate_page(person: Person) {
    for (let attribute of Person.mutable_attributes.keys()) {
        attribute = attribute as string;
        let original_element = document.getElementById(attribute);
        if (original_element === null) continue;

        let element = original_element.cloneNode(true) as HTMLElement;

        element.innerHTML = parse_attribute(person, attribute);

        if (element instanceof HTMLAnchorElement) {
            element.href = element.href + element.innerHTML;   
        }

        if (bulk_editing() && person.uid !== persons_array[0].uid) {
            merge_elements(attribute, element);
        } else {
            original_element.replaceWith(element);
        }
    }
    
    if (!bulk_editing()) {
        let element = document.getElementById("uid");
        if (element !== null && person.uid !== undefined) element.innerHTML = person.uid;

        set_profile_picture();
    }
}

function set_profile_picture() {
    if (persons_array.length > 0) {
        persons_array[0].fetch_photo((status, response: Blob) => {
            Shared.change_element("profile_picture", HTMLImageElement, (e) => {
                if (status === 200) {
                    const img_url = URL.createObjectURL(response);
                    e.src = img_url;
                } else {
                    e.src = Shared.BROKEN_IMAGE;
                }
            })
        })
    } else {
        console.debug("Not setting profile picture, persons_array is empty.");
    }
}

function parse_attribute(person: Person, attribute: string): string {
    const value = person.get(attribute);
    const type = Person.mutable_attributes.get(attribute);
    
    if (value === undefined) return "";
    
    if (type === "array") {
        let arr: string[] = [];
        if (Array.isArray(value)) {
            for (const v of value) {
                if (attribute === "phone_emergency") arr.push(`<a href="tel:${v}">${v}</a>`);
                else arr.push(`<a>${v}</a>`);

                arr.push(`<br>`);
            }
        } else {
            if (attribute === "phone_emergency") arr.push(`<a href="tel:${value}">${value}</a>`);
            else arr.push(`<a>${value}</a>`);
            arr.push(`<br>`);
        }
        return arr.join('');

    } else if (type === "checkbox") {
        return value === true ? "yes" : "no";

    } else if (type === "textarea") {
        return value.replaceAll("\n", "<br>");

    } else if (type === "text") {
        return value.replaceAll("_", " ");
    }

    return value;
}

function create_array(cur_element: HTMLElement) {
    let element = document.createElement("fieldset");
    
    let add_button = document.createElement("button");
    add_button.innerHTML = "Add entry";
    element.appendChild(add_button);

    let remove_button = document.createElement("button");
    remove_button.innerHTML = "Remove entry";
    element.appendChild(remove_button);
    remove_button.onclick = () => {
        let children = element.childNodes;
        if (children.length > 2) {
            element.removeChild(children.item(children.length - 3));
        }
    }

    const create_array_input = (): HTMLInputElement => {
        let input = document.createElement("input");
        input.type = "text";
        element.insertBefore(input, add_button);
        return input;
    }

    add_button.onclick = create_array_input;

    if (cur_element.classList.contains("multiple_values")) {
        element.classList.add("multiple_values");
        create_array_input().value = "multiple values";
    } else {
        for (const child of cur_element.children) {
            if (child instanceof HTMLAnchorElement) {
                create_array_input().value = child.innerHTML;
            }
        }
    }

    return element;
}

function edit() {
    
    Shared.change_element("cancel", HTMLElement, (e) => {
        e.style.display = "";
    });

    Shared.change_element("edit", HTMLElement, (e) => {
        e.style.display = "none";
    });

    for (let entry of Person.mutable_attributes.entries()) {
        let attribute = entry[0] as string;
        let type = entry[1];

        let cur_element = document.getElementById(attribute);
        if (cur_element === null) continue;

        let parent = cur_element.parentNode as HTMLElement;

        let new_element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLFieldSetElement = document.createElement("input")
        new_element.value = cur_element.innerHTML;

        if (cur_element.classList.contains("multiple_values")) {
            new_element.classList.add("multiple_values");
        }

        if (placeholders.has(attribute)){
            new_element.placeholder = placeholders.get(attribute)!;
        }

        if (type === "array") {
            new_element = create_array(cur_element);
        } else if (attribute === "membership") {
            new_element = document.createElement("select");
            if (cur_element.classList.contains("multiple_values")) {
                new_element.classList.add("multiple_values");
            }

            let create_option = (option: string, select_element: HTMLSelectElement): HTMLOptionElement => {
                let element = document.createElement("option");
                element.label = option.replaceAll("_", " ");
                element.value = option;
                select_element.options.add(element);

                if (cur_element.innerHTML === element.label) select_element.selectedIndex = select_element.options.length - 1;
                return element;
            };

            if (new_element.classList.contains("multiple_values")) { //if the current membership has multiple values (only possible while bulk editing), create disabled option "multiple_values"
                let option_element = create_option("multiple_values", new_element);
                
                option_element.label = "-- multiple values --";
                option_element.disabled = true;
                
                new_element.options.selectedIndex = 0
            }

            for (const option of ["member", "candidate_member", "former_member", "ex_member", "donor", "honorary_member", "member_of_merit", "external"]) {
                create_option(option, new_element);
            }
        } else {
            new_element.type = type;
            if (type === "checkbox") {
                new_element.checked = cur_element.innerHTML === "yes";
                new_element.classList.add("no-cursor");
            }
            else if (type === "textarea") {
                new_element = document.createElement("textarea");
                if (cur_element.classList.contains("multiple_values")) {
                    new_element.classList.add("multiple_values");
                }
                new_element.innerHTML = cur_element.innerHTML.replaceAll("<br>", "\n");

            }
        }

        new_element.id = attribute;
        new_element.oninput = (event) => {
            new_element.classList.add("changed");
        };

        parent.replaceChild(new_element, cur_element);

        cur_element.remove();
    }
}

function bulk_save(object_array: Person[], index = 0) {
    if (index < object_array.length && index >= 0) {
        save(object_array[index], (s, r) => {
            if (s === 200) {
                Shared.display_message(`Successfully saved for ${object_array[index].name}`);
                bulk_save(object_array, index + 1);
            } else {
                Shared.display_error(`Unable to save for ${object_array[index].name}`);
            }
        });
        return;
    }
    alert("Saved bulk changes");
    location.reload();
}

function save(person: Person, save_callback?: Callback) {
    console.debug(`Attempting to save ${person.uid}`);

    for (let entry of Person.mutable_attributes.entries()) {
        const attribute = entry[0] as string;
        const type = entry[1];

        let element = document.getElementById(attribute);
        
        let new_value: string | boolean | string[] | null;

        if (element === null 
            || !element.classList.contains("changed") 
            || !(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement || element instanceof HTMLFieldSetElement) ) {
            console.debug(`Skipping ${attribute}`);
            continue;

        } else if (element instanceof HTMLInputElement) {
            new_value = element.value;
            if (new_value === "") {
                new_value = null;

            } else if (["firstname", "surname", "nickname"].includes(attribute) 
                && !new_value.includes(" ")) {
                new_value = new_value.replace(/^\w/, c => c.toUpperCase()); //capitalize strings

            } else if (type === "checkbox") {
                new_value = element.checked;

            }
        } else if (element instanceof HTMLSelectElement) {
            let selected_element = element.selectedOptions.item(0);
            if (selected_element === null) {
                console.debug(`Skipping ${attribute}`);
                continue;
            }
            new_value = selected_element.value;

        } else if (element instanceof HTMLFieldSetElement) {
            new_value = [];
            for (const child of element.children) {
                if (child instanceof HTMLInputElement) {
                    new_value.push(child.value);
                }
            }
        } else {
            new_value = element.value;
        }

        person.set(attribute, new_value);      
    }
    person.save(save_callback);
}

function delete_person() {
    Bolklogin.check_authorization((status, response) => {
        if (status === 200) {
            if (bulk_editing() || persons_array[0] === undefined || persons_array[0].uid === undefined) return;

            else if (confirm(`Are you sure you want to delete ${persons_array[0].name}?`)) {
                if (!confirm("Select the CANCEL button if you're sure.")) {
                    Blip.delete_person(persons_array[0].uid, (s, r) => {
                        if (s === 200) {
                            alert(`Successfully deleted ${persons_array[0].name}`);
                            location.replace(ADDRESSES.APP);
                        } else {
                            Shared.display_error(r);
                        }
                    });
                }
            }
        } else {
            Shared.display_error("You are not authorized to do this.");
        }
    });
}

function reset_password() {
    if (bulk_editing() || persons_array[0] === undefined || persons_array[0].uid === undefined) return;

    Blip.reset_password(persons_array[0].uid, (status, response) => {
        if (status === 200) {
            Shared.display_message("Password reset successfully and mail sent.");
        } else {
            Shared.display_error("Server was not able to reset password.");
        }
    });
}

preload();