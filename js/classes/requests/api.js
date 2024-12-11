import {Storage} from "../helpers/storage";

export class API {

    static getParameter(name) {
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

    static getStateID() {
        if (Storage.getVariable(Storage.STORAGE.STATE_ID) != null) {
            return Storage.getVariable(Storage.STORAGE.STATE_ID);
        } else {
            Storage.setVariable(Storage.STORAGE.STATE_ID, Math.floor(Math.random() * 64646464).toString());
            return Storage.getVariable(Storage.STORAGE.STATE_ID);
        }
    }

}

