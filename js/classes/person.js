import {Blip} from "./requests/blip";
import {PersonController} from "./persons_controller";
import {Storage} from "./helpers/storage";

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

        let print = '';
        person.#attributes.forEach((v, k, m) => {
            print += `${k}: ${v} ${typeof v}\n`;
        });
        console.debug(print);
        return person;
    }

    getPhoto(callback) {
        if (this.#photo !== null) {
            callback(this.#photo);
        }
        Blip.getPersonPhoto(this.uid(), (response) => {
            this.#photo = response;
            callback(response);
        });
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
            let print = 'Changed attribute(s):\n';
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
                        location.reload();
                    }
                });
            } else {
                Blip.newPerson(JSON.stringify(to_save), (s, r) => {
                    if (s !== 200) {
                        Storage.display_error(r)
                    } else {
                        location.replace(Storage.APP_ADDRESS);
                    }
                });
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