import { Blip } from "./api/blip";
import { Callback } from "./api/request";
import { PersonController } from "./person_controller";
import { Shared } from "./share";

export interface IPerson {
    [key: string]: any;

    uid?: string;
    initials?: string;
    firstname?: string;
    surname?: string;
    nickname?: string;
    name?: string;
    membership?: string;
    dateofbirth?: string;
    pronouns?: string;
    email?: string;
    phone?: string;
    phone_emergency?: string;
    address?: string;
    inauguration_date?: string;
    resignation_letter_date?: string;
    resignation_date?: string;
    programme?: string;
    institution?: string;
    photo_visible?: boolean;
    iva?: boolean;
    dead?: boolean;
    no_obligations?: boolean;
    avg?: boolean;
    avg_address?: boolean;
    avg_dob?: boolean;
    avg_institution?: boolean;
    avg_programme?: boolean;
    avg_email?: boolean;
    avg_phone_emergency?: boolean;
    avg_phone?: boolean;
    avg_pronouns?: boolean;
}

export class Person implements IPerson {
    [key: string]: any;

    uid?: string;
    initials?: string;
    firstname?: string;
    surname?: string;
    nickname?: string;
    name?: string;
    membership?: string;
    dateofbirth?: string;
    pronouns?: string;
    email?: string;
    phone?: string;
    phone_emergency?: string;
    address?: string;
    inauguration_date?: string;
    resignation_letter_date?: string;
    resignation_date?: string;
    programme?: string;
    institution?: string;
    photo_visible?: boolean;
    iva?: boolean;
    dead?: boolean;
    no_obligations?: boolean;
    avg?: boolean;
    avg_address?: boolean;
    avg_dob?: boolean;
    avg_institution?: boolean;
    avg_programme?: boolean;
    avg_email?: boolean;
    avg_phone_emergency?: boolean;
    avg_phone?: boolean;
    avg_pronouns?: boolean;

    static mutable_attributes: Map<keyof IPerson, string> = new Map([
        ["initials", "text"],
        ["firstname", "text"],
        ["surname", "text"],
        ["nickname", "text"],
        ["email", "email"],
        ["pronouns", "text"],
        ["phone", "tel"],
        ["phone_emergency", "array"],
        ["address", "textarea"],
        ["dateofbirth", "date"],
        ["membership", "options"],
        ["inauguration_date", "date"],
        ["resignation_letter_date", "date"],
        ["resignation_letter_date", "date"],
        ["resignation_date", "date"],
        ["programme", "array"],
        ["institution", "array"],
        ["dead", "checkbox"],
        ["no_obligations", "checkbox"]
    ]);

    private dirty: (keyof IPerson)[] = [];

    private photo: string | Blob = "";

    constructor(data: IPerson = {}) {
        Object.assign(this, data);
    }

    static from_empty() {
        let person = new Person();
        for (let attribute of this.mutable_attributes.keys()) {
            person.set(attribute, "");
        }
        person.membership = "candidate_member";
        return person;
    }

    static from_json(json: IPerson) {
        let person = new Person(json);
        
        return person;
    }

    fetch_photo(callback: Callback) {
        if (this.has_photo()) {
            callback(200, this.photo);
            return;
        }
        
        if (this.uid !== undefined) Blip.get_person_photo(this.uid, callback);
    }

    get_photo(): string | Blob  {
        if (this.has_photo()) {
            return this.photo;
            
        }
        return Shared.BROKEN_IMAGE;
    }

    set_photo(photo: string | Blob) {
        if (this.has_photo()) {
            return;
        }

        this.photo = photo;
    }

    has_photo(): boolean {
        return this.photo !== "";
    }

    get<K extends keyof IPerson>(key: K): IPerson[K] {
        return this[key];
    }

    set<K extends keyof IPerson>(key: K, value: IPerson[K]): boolean {
        if (!Person.mutable_attributes.has(key)) return false;

        (this as IPerson)[key] = value;
        this.dirty.push(key);
        return true;
    }

    save(callback?: Callback) {
        if (this.changed_attributes.size > 0) {
            
            let to_save: IPerson = {};
            for (const k of this.dirty) {
                const key = k as keyof IPerson;
                to_save[key] = this.get(key);
            }
            console.debug(print);

            if (this.uid !== undefined) {
                Blip.update_person(this.uid, to_save, callback);
                // Blip.patchPerson(this.uid(), JSON.stringify(to_save), (s, r) => {
                //     if (s !== 200) {
                //         Storage.display_error(r);
                //     } else {
                //         if (callback !== null) {
                //             callback();
                //         } else {
                //             alert(`Successfully saved changes for ${this.get("name")}`);
                //             location.reload();
                //         }
                //     }
                // });
            } else {
                let create_person = () => Blip.new_person(to_save, callback);
                let display_error = () => Shared.display_error("A user with this email address already exists.");
                   
                //     (s, r) => {
                //     if (s !== 200) {
                //         Storage.display_error(r)
                //     } else {
                //         alert(`Successfully created ${to_save["firstname"]} ${to_save["surname"]}`);
                //         location.replace(Storage.APP_ADDRESS);
                //     }
                // });

                if (this.email !== undefined) PersonController.email_registered(this.email, display_error, create_person);
                else Shared.display_error("No email address has been provided, please provide one.");
            }
        }
    }

    to_array(): string[] {
        let data: string[] = [];
        for (const k of Person.mutable_attributes.keys()) {
            const key = k as keyof IPerson;
            data.push(this.get(key));
        }
        return data;
    }
}