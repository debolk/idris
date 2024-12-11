export class Storage {
    static STORAGE = Object.freeze({
        ACCESS_TOKEN_STORAGE: "bolk-access-token",
        REFRESH_TOKEN_STORAGE: "bolk-refresh-token",
        EXPIRY_TOKEN_STORAGE: "bolk-token-expiry",
        STATE_ID: "stateID"
    });
    static PARAMETERS = Object.freeze({
        ACCESS_TOKEN: "access_token",
        EXPIRES: "expires_in",
        REFRESH_TOKEN: "refresh_token"
    });

    static APP_REDIRECT_ADDRESS = "https://idris.i.bolkhuis.nl/login";
    static APP_ADDRESS = "https://idris.i.bolkhuis.nl";
    static LOGIN_ADDRESS = "https://auth.i.bolkhuis.nl/";
    static BLIP_ADDRESS = "https://blip2.i.bolkhuis.nl";

    static CLIENT_SECRET = "bWVsb2R5NjR2bw==" //TODO: create better way to get secret
    static CLIENT_ID = "idris";

    static DEBUG = true;

    static debug(msg, source = null){
        if (this.DEBUG) {
            if (source != null) {
                console.log("[DEBUG] - " + source + ": " + msg);
            } else {
                console.log("[DEBUG]: " + msg)
            }
        }
    }

    static hasVariable(name) {
        return sessionStorage.getItem(name) !== null;
    }

    static getVariable(name) {
        return sessionStorage.getItem(name);
    }

    static setVariable(name, value) {
        sessionStorage.setItem(name, value.toString());
    }
}