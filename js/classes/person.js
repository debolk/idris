import {Blip} from "./requests/blip";
import {PersonController} from "./persons_controller";
import {Storage} from "./helpers/storage";

export class Person {

    /**
     * @type {Map<string, string>}
     */
    #attributes;

    /**
     * @type {String}
     */
    #photo;

    available_attributes = {
        "initials": "string",
        "firstname": "string",
        "surname": "string",
        "nickname": "string",
        "email": "string",
        "pronouns": "string",
        "phone": "phone_number",
        "phone_emergency": "phone_number",
        "address": "multiline_string",
        "dateofbirth": "date",
        "membership": "options",
        "inauguration_date": "date",
        "resignation_letter_date": "date",
        "resignation_date": "date",
        "programme": "multiline_string",
        "institution": "multiline_string",
        "dead": "bool"
    }

    constructor(json) {
        if (typeof json === "string") json = JSON.parse(json)

        this.#attributes = new Map();
        this.#photo = null;
        for (let entry of Object.entries(json)){
            this.#attributes.set(entry[0], entry[1]);
        }
        let print = '';
        this.#attributes.forEach((v, k, m) => {
          print += `${k}: ${v} ${typeof v}\n`;
        });
        console.debug(print);
    }

    /**
     *
     * @param {string} json
     * @returns {PersonController}
     */
    static fromArray(json) {
        let persons = new PersonController();
        json = JSON.parse(json);
        for (let entry of json){
            persons.add_person(new Person(entry))
        }
        return persons;
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

    get(var_name){
        if ( !this.#attributes.has(var_name) ) return undefined;
        return this.#attributes.get(var_name);
    }

    uid(){
        return this.get('uid');
    }
}