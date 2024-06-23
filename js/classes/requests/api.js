class API {
    static VAR_NAMES = {"STATE_ID": "stateID", "ACCESS_TOKEN": "bolk-access-token", "REFRESH_TOKEN": "bolk-refresh-token"}
    static LOGIN_ADDRESS = "http://10.99.1.105:8002/" //"login.i.bolkhuis.nl"

    static CLIENT_SECRET = "bWVsb2R5NjR2bw==" //TODO: create better way to get secret
    static CLIENT_ID = "melody_ldap"

    getVariable(name) {
        return sessionStorage.getItem(name);
    }

    setVariable(name, value) {
        sessionStorage.setItem(name, value.toString());
    }

    getStateID() {
        if (sessionStorage.getItem(API.VAR_NAMES.STATE_ID) != null) {
            return sessionStorage.getItem(API.VAR_NAMES.STATE_ID);
        } else {
            sessionStorage.setItem(API.VAR_NAMES.STATE_ID, Math.floor(Math.random() * 64646464).toString());
            return sessionStorage.getItem(API.VAR_NAMES.STATE_ID);
        }
    }

    checkLoginState() {
        return this.getVariable(API.VAR_NAMES.ACCESS_TOKEN) != null;
    }

    async checkAuthorization() {
        new Request(Request.RequestType.POST, API.LOGIN_ADDRESS += "bestuur/?access_token=" + this.getVariable(API.VAR_NAMES.ACCESS_TOKEN), (status, response) => {
           return status === 200;
        });
    }
}

class Request {

    static RequestType = {"POST": "POST", "PUT": "PUT", "GET": "GET"};

    constructor(type, url, callback, json = null) {
        let request = new XMLHttpRequest();
        request.open(type, url);
        request.setRequestHeader("Content-Type", "application/json; charset=UTF-8");

        request.onreadystatechange = () => {
            if ( request.readyState === 4){
                callback(request.status, request.responseText);
            }
        }

        if (json != null) request.send(JSON.stringify(json));
        else request.send();
    }
}