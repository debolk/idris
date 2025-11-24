import { Blip } from "./api/blip";
import { IPerson, Person } from "./person";

type FilterFunction = (attribute: string, filter: string) => boolean;

export class PersonController{

    private static default_filters: { [key: string]: FilterFunction} = {
        name: this.#filter_startswith,
        dateofbirth: this.#filter_includes,
        membership: this.#filter_exact,
        phone: this.#filter_includes,
        phone_emergency: this.#filter_includes,
        email: this.#filter_startswith,
        address: this.#filter_startswith,
        institution: this.#filter_startswith,
        programme: this.#filter_includes,
        inauguration_date: this.#filter_startswith
    }

    private persons: Map<string, IPerson> = new Map();
    
    private displayed_persons: IPerson[] = [];

    static from_array(json: object): PersonController {
        let persons = new PersonController();
        
        for (let entry of Object.values(json)){
            persons.add_person(Person.from_json(entry));
        }

        return persons;
    }

    static email_registered(email: string, on_registered: () => void, on_unregistered: () => void, on_error: () => void = () => {alert("An error occured with BLIP\nPlease contact Beheer.")}) {
        Blip.get_request(`/persons/registered?email=${email}`, (status, response: object) => {
            if (status === 200 && "result" in response) {
                if (response["result"]) {
                    on_registered();
                } else {
                    on_unregistered();
                }
            } else {
                on_error();
            }
        });
    }

    to_csv() {
        if (this.displayed_persons == null) return '';
        let csv = '';
        let data = [];
        data.push(Array.from(Person.mutable_attributes.keys()));
        for (let person of this.displayed_persons) {
            data.push(person.to_array());
        }

        data.forEach(row => {
            csv += row.join(',') + '\n';
        });
        return csv;
    }

    get_displayed(): IPerson[] {
        return this.displayed_persons.sort((a, b) => {
            if (a.firstname === undefined || b.firstname === undefined) {
                if (a.uid !== undefined && b.uid !== undefined) return a.uid.localeCompare(b.uid);
                return 0;
            }
            return a.firstname.localeCompare(b.firstname);
        });
    }

    add_person(person: IPerson) {
        if (person.uid !== undefined) this.persons.set(person.uid, person);
    }

    get_person(uid: string): Person | undefined {
        if (this.persons.has(uid) && this.persons.get(uid) instanceof Person) return this.persons.get(uid) as Person;
        return undefined;
    }

    default_filter() {
        this.displayed_persons = [];
        this.filter("membership", "member");
    }

    filter(attribute: string, filter: string): void {
        this.displayed_persons = [];

        let fn;

        if (filter === "*") {
            this.displayed_persons = Array.from(this.persons.values());
            return;

        } else if (filter.startsWith("\"") && filter.endsWith("\"")) {
            fn = PersonController.#filter_exact;
            filter = filter.substring(1, filter.length - 1);

        } else if (filter.startsWith("*") && filter.endsWith("*")){
            fn = PersonController.#filter_includes;
            filter = filter.substring(1, filter.length - 1);

        } else if (filter.startsWith("*")) {
            fn = PersonController.#filter_endswith;
            filter = filter.substring(1);

        } else if (filter.endsWith("*")) {
            fn = PersonController.#filter_startswith;
            filter = filter.substring(0, filter.length - 1);

        } else {
            fn = PersonController.default_filters[attribute];
        }

        filter = filter.toLowerCase().trim();
        console.debug(filter, attribute, fn);

        if (attribute === "name") {
            return this.#filter_name(filter, fn);
        } else {
            return this.#filter_var(attribute, filter, fn);
        }
    }

    #filter_name(filter: string, filter_function: FilterFunction) {
        for (let person of this.persons.values()) {
            if ((person.name !== undefined && filter_function(person.name.toLowerCase().trim(), filter)) ||
                (person.firstname !== undefined && filter_function(person.firstname.toLowerCase().trim(), filter)) ||
                (person.surname !== undefined && filter_function(person.surname.toLowerCase().trim(), filter)) ||
                (person.nickname !== undefined && filter_function(person.nickname.toLowerCase().trim(), filter)) ||
                (person.uid !== undefined && filter_function(person.uid.toLowerCase().trim(), filter))) {
                this.displayed_persons.push(person);
            }
        }
    }

    #filter_var(attribute: string, filter: string, filter_function: FilterFunction) {
        for (let person of this.persons.values()) {

            let attr = person.get(attribute);

            if (attr !== undefined &&
                filter_function(attr.toLowerCase().trim(), filter)){
                this.displayed_persons.push(person);
            }
        }
    }

    static #filter_exact(attribute: string, filter: string): boolean {
        return attribute === filter;
    }

    static #filter_startswith(attribute: string, filter: string): boolean {
        // filter*
        return attribute.startsWith(filter);
    }

    static #filter_endswith(attribute: string, filter: string): boolean {
        // *filter
        return attribute.endsWith(filter);
    }

    static #filter_includes(attribute: string, filter: string): boolean {
        // *filter*
        return attribute.includes(filter);
    }

}
