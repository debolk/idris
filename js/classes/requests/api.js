import {Request} from "./request.js";

export class API {
    static VAR_NAMES = {"STATE": "state", "ACCESS_TOKEN": "access_token", "EXPIRES": "expires_in", "REFRESH_TOKEN": "refresh_token", "STATE_ID": "stateID", "ACCESS_TOKEN_STORAGE": "bolk-access-token", "REFRESH_TOKEN_STORAGE": "bolk-refresh-token", "EXPIRY_TOKEN_STORAGE": "bolk-token-expiry"};
    static LOGIN_ADDRESS = "http://10.99.1.105:8002/"; //"login.i.bolkhuis.nl"
    static APP_ADDRESS = "http://10.99.1.105:8008/login";

    static CLIENT_SECRET = "bWVsb2R5NjR2bw==" //TODO: create better way to get secret
    static CLIENT_ID = "I.D.R.I.S.";

    static getAccessToken() {
        return this.getVariable(this.VAR_NAMES.ACCESS_TOKEN_STORAGE);
    }

    static getVariable(name) {
        return sessionStorage.getItem(name);
    }

    static setVariable(name, value) {
        sessionStorage.setItem(name, value.toString());
    }

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
        if (sessionStorage.getItem(API.VAR_NAMES.STATE_ID) != null) {
            return sessionStorage.getItem(API.VAR_NAMES.STATE_ID);
        } else {
            sessionStorage.setItem(API.VAR_NAMES.STATE_ID, Math.floor(Math.random() * 64646464).toString());
            return sessionStorage.getItem(API.VAR_NAMES.STATE_ID);
        }
    }

    static checkLoginState() {
        if (this.getVariable(API.VAR_NAMES.ACCESS_TOKEN_STORAGE) == null
            || this.getVariable(API.VAR_NAMES.ACCESS_TOKEN_STORAGE) == null) return false;

        let current_date = new Date().getTime();
        let expiry_date = this.getVariable(API.VAR_NAMES.EXPIRY_TOKEN_STORAGE);

        return current_date < expiry_date;
    }

    static async checkAuthorization() {
        new Request(Request.RequestType.POST, API.LOGIN_ADDRESS += "bestuur/?access_token=" + this.getVariable(API.VAR_NAMES.ACCESS_TOKEN_STORAGE), (status, response) => {
           return status === 200;
        });
    }
}

