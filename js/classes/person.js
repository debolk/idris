import {Blip} from "./requests/blip";
import {PersonController} from "./persons_controller";

export class Person {

    uid;
    href;
    initials;
    firstname;
    surname;
    nickname;
    email;
    pronouns;
    phone;
    phone_emergency;
    address;
    dateofbirth;
    membership;
    inauguration_date;
    resignation_letter_date;
    resignation_date;
    programme;
    institution;
    dead;
    photo;

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
        if (typeof json === "string") json = JSON.parse(json);

        this.uid = json.uid;
        this.href = json.href;
        this.initials = json.initials;
        this.firstname = json.firstname;
        this.surname = json.surname;
        this.nickname = json.nickname;
        this.fullname = json.name;
        this.email = json.email;
        this.pronouns = json.pronouns;
        this.phone = json.phone;
        this.phone_emergency = json.phone_emergency;
        this.address = json.address;
        this.dateofbirth = json.dateofbirth;
        this.membership = json.membership;
        this.inauguration_date = json.inauguration_date;
        this.resignation_letter_date = json.resignation_letter_date;
        this.resignation_date = json.resignation_date;
        this.programme = json.programme;
        this.institution = json.institution;
        this.dead = json.dead;
        this.photo = null;
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
        if (this.photo !== null) {
            callback(this.photo);
        }
        Blip.getPersonPhoto(this.uid, (response) => {
            this.photo = response;
            callback(response);
        });
    }

    get(var_name){
        switch(var_name){
            case "initials":
                return this.initials;
            case "firstname":
                return this.firstname;
            case "surname":
                return this.surname;
            case "nickname":
                return this.nickname;
            case "fullname":
                return this.fullname;
            case "dateofbirth":
                return this.dateofbirth;
            case "pronouns":
                return this.pronouns;
            case "email":
                return this.email;
            case "phone":
                return this.phone;
            case "phone_emergency":
                return this.phone_emergency;
            case "address":
                return this.address;
            case "inauguration_date":
                return this.inauguration_date;
            case "resignation_letter_date":
                return this.resignation_letter_date;
            case "programme":
                return this.programme;
            case "institution":
                return this.institution;
            case "membership":
                return this.membership;
            case "dead":
                return this.dead;
            default:
                return;
        }
    }
}