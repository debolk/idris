import {Person} from "./person";
import {Storage} from "./helpers/storage";

export class PersonController{

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

        } else if (attribute === 'membership' ||
            (filter.startsWith("\"") && filter.endsWith("\""))) {

            filterFunc = this.#filter_exact;
            if (filter.startsWith("\"") && filter.endsWith("\"")) {
                filter = filter.substring(1, filter.length - 1);
            }

        } else if (filter.startsWith("*") && filter.endsWith("*")){

            filterFunc = this.#filter_includes;
            filter = filter.substring(1, filter.length - 1);

        } else if (filter.startsWith("*")) {

            filterFunc = this.#filter_endswith;
            filter = filter.substring(1);

        } else { //by default search as if filter = filter*

            filterFunc = this.#filter_startswith;
            if (filter.endsWith("*")) {
                filter = filter.substring(0, filter.length - 1);
            }

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
     * @param {string} attribute
     * @param {string} filter
     * @returns {boolean}
     */
    #filter_exact(attribute, filter) {
        return attribute === filter;
    }

    /**
     *
     * @param {string} attribute
     * @param {string} filter
     * @returns {boolean}
     */
    #filter_startswith(attribute, filter) {
        // filter*
        return attribute.startsWith(filter);
    }

    /**
     *
     * @param {string} attribute
     * @param {string} filter
     * @returns {boolean}
     */
    #filter_endswith(attribute, filter) {
        // *filter
        return attribute.endsWith(filter);
    }

    /**
     *
     * @param {string} attribute
     * @param {string} filter
     * @returns {boolean}
     */
    #filter_includes(attribute, filter) {
        // *filter*
        return attribute.includes(filter);
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

}
