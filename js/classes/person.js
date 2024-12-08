export class Person {

    uid;
    href;
    initials;
    firstname;
    surname;
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

    changed = {};

    constructor(json) {
        if (typeof json === String) json = JSON.parse(json);

        console.log(json);

        this.uid = json.uid;
        this.href = json.href;
        this.initials = json.initials;
        this.firstname = json.firstname;
        this.surname = json.surname;
        this.fullname = json.name;
        this.email = json.email;
        this.pronouns = json.pronouns;
        this.phone = json.phone;
        this.phone_emergency = json.phone_emergency;
        this.address = json.address;
        this.dateofbirth = json.dateofbirth;
        this.membership = json.membership;
        this.resignation_letter_date = json.resignation_letter_date;
        this.resignation_date = json.resignation_date;
        this.programme = json.programme;
        this.institution = json.institution;
        this.dead = json.dead;
    }

    save() {
        //TODO SAVE TO BLIP TO SAVE IN LDAP
    }

    static fromArray(json) {
        let persons = [];
        json = JSON.parse(json);
        for (let entry of json){
            persons.push(new Person(entry));
        }
        return persons;
    }

    set(var_name, value){
        this.changed.put(var_name, value);
        switch(var_name){
            case "initials":
                this.initials = value;
            case "firstname":
                this.firstname = value;
            case "surname":
                this.surname = value;
            case "nickname":
                this.nickname = value;
            case "dateofbirth":
                this.dateofbirth = value;
            case "pronouns":
                this.pronouns = value;
            case "email":
                this.email = value;
            case "phone":
                this.phone = value;
            case "phone_emergency":
                this.phone_emergency = value;
            case "address":
                this.address = value;
            case "inauguration_date":
                this.inauguration_date = value;
            case "resignation_letter_date":
                this.resignation_letter_date = value;
            case "programme":
                this.programme = value;
            case "institution":
                this.institution = value;
            case "membership":
                this.membership = value;
            case "dead":
                this.dead = value;
            default:
                return;
        }
    }

    get_variable(var_name){
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