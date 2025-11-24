import { Shared, STORAGE_KEYS } from "../share";

export class API {

    static get_parameter(name: string) {
        let query = location.search.substring(1);
        let vars = query.split("&");
        for (let i=0; i<vars.length; i++) {
            let pair = vars[i].split("=");
            if (pair[0] === name) {
                return pair[1];
            }
        }
        return null;
    }

    static get_stateid() {
        if (Shared.has_var(STORAGE_KEYS.STATE_ID)) {
            return Shared.get_var(STORAGE_KEYS.STATE_ID);
        } else {
            Shared.set_var(STORAGE_KEYS.STATE_ID, API.generate_uuid());
            return Shared.get_var(STORAGE_KEYS.STATE_ID);
        }
    }

    static generate_uuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = crypto.getRandomValues(new Uint8Array(1))[0];
            const v = c === 'x' ? (r & 0x0f) : ((r & 0x03) | 0x08);
            return v.toString(16);
        });
    }

}

