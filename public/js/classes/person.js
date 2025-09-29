import {Blip} from "/js/classes/requests/blip.js";
import {Storage} from "/js/classes/helpers/storage.js";
import {PersonController} from "/js/classes/persons_controller.js";

export class Person {
    /**
     *
     * @type {Map<string, string>}
     */
    static available_attributes = new Map([
        ["initials", "string"],
        ["firstname", "string"],
        ["surname", "string"],
        ["nickname", "string"],
        ["email", "string"],
        ["pronouns", "string"],
        ["phone", "phone_number"],
        ["phone_emergency", "phone_number"],
        ["address", "multiline_string"],
        ["dateofbirth", "date"],
        ["membership", "options"],
        ["inauguration_date", "date"],
        ["resignation_letter_date", "date"],
        ["resignation_letter_date", "date"],
        ["resignation_date", "date"],
        ["programme", "multiline_string"],
        ["institution", "multiline_string"],
        ["dead", "bool"],
        ["no_obligations", "bool"]
    ]);

    /**
     * @type {Map<string, any>}
     */
    #attributes;

    /**
     * @type {Map<string, any>}
     */
    #changed_attributes;

    /**
     * @type {String}
     */
    #photo;

    constructor() {
        this.#attributes = new Map();
        this.#changed_attributes = new Map();

        this.#photo = null;
    }

    static fromEmpty() {
        let person = new Person();
        for (let attribute of this.available_attributes.keys()) {
            person.#attributes.set(attribute, "");
        }
        person.#attributes.set('membership', "candidate_member");
        return person;
    }

    static fromArray(json) {
        if (typeof json === "string") json = JSON.parse(json);
        let person = new Person();

        for (let entry of Object.entries(json)){
            person.#attributes.set(entry[0], entry[1]);
        }
        
        if (Storage.hasVariable(`${person.uid()}-photo`)) {
            person.setPhoto(Storage.getVariable(`${person.uid()}-photo`));
        }

        //let print = '';
        //person.#attributes.forEach((v, k, m) => {
        //    print += `${k}: ${v} ${typeof v}\n`;
        //});
        //console.debug(print);
        return person;
    }

    fetchPhoto(callback) {
        if (this.hasPhoto()) {
            callback(this.#photo);
            return;
        }
        
        Blip.getPersonPhoto(this.uid(), (response) => {
            this.#photo = response;
            callback(response);
        });
    }

    getPhoto() {
        if (this.hasPhoto()) {
            return this.#photo;
            
        } else if (Storage.hasVariable(`${this.uid()}-photo`)) {
            this.setPhoto(Storage.getVariable(`${this.uid()}-photo`));
            return this.#photo;
        }
    }

    setPhoto(photo) {
        if (this.hasPhoto()) {
            return;
        } else if (!Storage.hasVariable(`${this.uid()}-photo`)) {
            Storage.setVariable(`${this.uid()}-photo`, photo);
        }

        this.#photo = photo;
    }

    hasPhoto() {
        return this.#photo !== null;
    }

    get(var_name) {
        if ( !this.#attributes.has(var_name) ) return undefined;
        return this.#attributes.get(var_name);
    }

    set(var_name, value) {
        if ( !Person.available_attributes.has(var_name) ) return false;

        this.#attributes.set(var_name, value);
        this.#changed_attributes.set(var_name, value);

        return true;
    }

    save() {
        if (this.#changed_attributes.size > 0) {
            let to_save = {};
            let print = 'Attribute(s):\n';
            this.#changed_attributes.forEach((v, k, m) => {
                print += `${k}: ${v}\n`;
                to_save[k] = v;
            })
            console.debug(print);

            if (this.get('uid') !== undefined) {
                Blip.patchPerson(this.uid(), JSON.stringify(to_save), (s, r) => {
                    if (s !== 200) {
                        Storage.display_error(r);
                    } else {
                        alert(`Successfully saved changes in ${this.get("name").endsWith('s') ? this.get("name") + "'" : this.get("name") + "'s"} account`);
                        location.reload();
                    }
                });
            } else {
                let create_person = () => Blip.newPerson(JSON.stringify(to_save), (s, r) => {
                    if (s !== 200) {
                        Storage.display_error(r)
                    } else {

                        alert(`Successfully created ${to_save["firstname"]} ${to_save["surname"].endsWith('s') ? to_save["surname"] + "'" : to_save["surname"] + "'s"} account`);
                        location.replace(Storage.APP_ADDRESS);
                    }
                });

                PersonController.emailRegistered(this.#attributes.get("email"), (name, membership) => {
                    Storage.display_error(`A user with this email address already exists: ${name}<br>They are a(n) ${membership}.`);
                }, create_person);
            }
        }
    }

    toArray() {
        let data = [];
        for (let key of Person.available_attributes.keys()){
            let value = this.get(key);
            if (value === undefined) value = '';
            else if (typeof value === "string" && value.toString().includes(",")) {
                value = '"' + value + '"';
            }
            data.push(value);
        }
        return data;
    }

    uid() {
        return this.get('uid');
    }
}