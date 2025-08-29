import {Person} from "./person";
import {Blip} from "./requests/blip";

export class PersonController{

    static #default_filters = {
        'name': this.#filter_startswith,
        'dateofbirth': this.#filter_includes,
        'membership': this.#filter_exact,
        'phone': this.#filter_includes,
        'phone_emergency': this.#filter_includes,
        'email': this.#filter_startswith,
        'address': this.#filter_startswith,
        'institution': this.#filter_startswith,
        'programme': this.#filter_includes,
        'inauguration_date': this.#filter_startswith
    }

    /**
     *
     * @type {Map<string, Person>}
     */
    #persons;
    /**
     *
     * @type {Array<Person>}
     */
    #displayed_persons;

    constructor() {
        this.#persons = new Map();
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
            persons.add_person(Person.fromArray(entry));
        }
        return persons;
    }


    static emailRegistered(email, on_registered, on_unregistered) {
        Blip.getAllBasic((response) => {
            let json = JSON.parse(response);
            for (let json_person of json) {
                if (json_person["email"].toLowerCase() === email.toLowerCase()) {
                    on_registered(json_person["name"], json_person["membership"]);
                    return;
                }
            }
            on_unregistered();
        });
    }

    toCSV() {
        if (this.#displayed_persons == null) return;
        let csv = '';
        let data = [];
        data.push(Array.from(Person.available_attributes.keys()));
        for (let person of this.#displayed_persons) {
            data.push(person.toArray());
        }

        data.forEach(row => {
            csv += row.join(',') + '\n';
        });
        return csv;
    }

    /**
     *
     * @returns {Array<Person>}
     */
    getDisplayedPersons() {
        return this.#displayed_persons.sort((a, b) => {
            if (a.get("firstname") === undefined || b.get("firstname") === undefined) {
                return a.uid().localeCompare(b.uid());
            }
            return a.get("firstname").localeCompare(b.get("firstname"));
        });
    }

    /**
     *
     * @param person
     */
    add_person(person) {
        this.#persons.set(person.uid(), person);
    }

    /**
     *
     * @param {string} uid
     * @returns {Person}
     */
    get_person(uid) {
        if (this.#persons.has(uid)) return this.#persons.get(uid);
        return null;
    }

    /**
     *
     * @returns {Array<Person>}
     */
    default_filter() {
        this.#displayed_persons = [];
        return this.filter("membership", "member");
    }

    /**
     *
     * @param {string} attribute
     * @param {string} filter
     * @returns {Array<Person>}
     */
    filter(attribute, filter) {
        this.#displayed_persons = [];

        let filterFunc;


        if (filter === "*") {
            this.#displayed_persons = this.#persons;
            return;

        } else if (filter.startsWith("\"") && filter.endsWith("\"")) {
            filterFunc = PersonController.#filter_exact;
            filter = filter.substring(1, filter.length - 1);
        } else if (filter.startsWith("*") && filter.endsWith("*")){
            filterFunc = PersonController.#filter_includes;
            filter = filter.substring(1, filter.length - 1);

        } else if (filter.startsWith("*")) {
            filterFunc = PersonController.#filter_endswith;
            filter = filter.substring(1);

        } else if (filter.endsWith("*")) {
            filterFunc = PersonController.#filter_startswith;
            filter = filter.substring(0, filter.length - 1);

        } else {
            filterFunc = PersonController.#default_filters[attribute];
        }

        filter = filter.toLowerCase().trim();
        console.debug(filter, attribute, filterFunc);

        if (attribute === "name") {
            this.#filter_name(filter, filterFunc);
        } else {
            this.#filter_var(attribute, filter, filterFunc);
        }
    }

    /**
     *
     * @param {string} filter
     * @param {CallableFunction} filterFunc
     * @returns {Array<Person>}
     */
    #filter_name(filter, filterFunc) {
        for (let person of this.#persons.values()) {
            if ((person.get("name") !== undefined && filterFunc(person.get("name").toLowerCase().trim(), filter)) ||
                (person.get("firstname") !== undefined && filterFunc(person.get("firstname").toLowerCase().trim(), filter)) ||
                (person.get("surname") !== undefined && filterFunc(person.get("surname").toLowerCase().trim(), filter)) ||
                (person.get("nickname") !== undefined && filterFunc(person.get("nickname").toLowerCase().trim(), filter)) ||
                filterFunc(person.uid().toLowerCase().trim(), filter)) {
                this.#displayed_persons.push(person);
            }
        }
    }

    /**
     *
     * @param {string} attribute
     * @param {string} filter
     * @param {CallableFunction} filterFunc
     * @returns {Array<Person>}
     */
    #filter_var(attribute, filter, filterFunc) {
        for (let person of this.#persons.values()) {

            let attr = person.get(attribute);

            if (attr !== undefined &&
                filterFunc(attr.toString().toLowerCase().trim(), filter)){
                this.#displayed_persons.push(person);
            }
        }
    }

    /**
     *
     * @param {string} attribute
     * @param {string} filter
     * @returns {boolean}
     */
    static #filter_exact(attribute, filter) {
        return attribute === filter;
    }

    /**
     *
     * @param {string} attribute
     * @param {string} filter
     * @returns {boolean}
     */
    static #filter_startswith(attribute, filter) {
        // filter*
        return attribute.startsWith(filter);
    }

    /**
     *
     * @param {string} attribute
     * @param {string} filter
     * @returns {boolean}
     */
    static #filter_endswith(attribute, filter) {
        // *filter
        return attribute.endsWith(filter);
    }

    /**
     *
     * @param {string} attribute
     * @param {string} filter
     * @returns {boolean}
     */
    static #filter_includes(attribute, filter) {
        // *filter*
        return attribute.includes(filter);
    }

}
