class Person {

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

        this.uid = json._uid;
        this.href = json._href;
        this.initials = json._initials;
        this.firstname = json._firstname;
        this.lastname = json._surname;
        this.email = json._email;
        this.pronouns = json._pronouns;
        this.phone = json._phone;
        this.phone_emergency = json._phone_emergency;
        this.address = json._address;
        this.dateofbirth = json._dateofbirth;
        this.membership = json._membership;
        this.resignation_letter_date = json._resignation_letter_date;
        this.resignation_date = json._resignation_date;
        this.programme = json._programme;
        this.institution = json._institution;
        this.dead = json._dead;
    }

    save() {
        //TODO SAVE TO BLIP TO SAVE IN LDAP
    }

    set_variable(var_name, value){
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