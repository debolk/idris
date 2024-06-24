class Person {

    uid;
    href;
    intials;
    firstname;
    lastname;
    email;
    pronouns;
    phone;
    phone_parents;
    address;
    dateofbirth;
    membership;

    constructor(json) {
        if (typeof json === String) json = JSON.parse(json);

        this._uid = json._uid;
        this._href = json._href;
        this._intials = json._intials;
        this._firstname = json._firstname;
        this._lastname = json._lastname;
        this._email = json._email;
        this._pronouns = json._pronouns;
        this._phone = json._phone;
        this._phone_parents = json._phone_parents;
        this._address = json._address;
        this._dateofbirth = json._dateofbirth;
        this._membership = json._membership;
        this._json = json;

    }

    save() {
        //TODO SAVE TO BLIP TO SAVE IN LDAP
    }

    get intials() {
        return this._intials;
    }

    set intials(value) {
        this._intials = value;
    }

    get json() {
        return this._json;
    }

    set json(value) {
        this._json = value;
    }

    get uid() {
        return this._uid;
    }

    set uid(value) {
        this._uid = value;
    }

    get href() {
        return this._href;
    }

    set href(value) {
        this._href = value;
    }

    get firstname() {
        return this._firstname;
    }

    set firstname(value) {
        this._firstname = value;
    }

    get lastname() {
        return this._lastname;
    }

    set lastname(value) {
        this._lastname = value;
    }

    get email() {
        return this._email;
    }

    set email(value) {
        this._email = value;
    }

    get pronouns() {
        return this._pronouns;
    }

    set pronouns(value) {
        this._pronouns = value;
    }

    get phone() {
        return this._phone;
    }

    set phone(value) {
        this._phone = value;
    }

    get phone_parents() {
        return this._phone_parents;
    }

    set phone_parents(value) {
        this._phone_parents = value;
    }

    get address() {
        return this._address;
    }

    set address(value) {
        this._address = value;
    }

    get dateofbirth() {
        return this._dateofbirth;
    }

    set dateofbirth(value) {
        this._dateofbirth = value;
    }

    get membership() {
        return this._membership;
    }

    set membership(value) {
        this._membership = value;
    }
}