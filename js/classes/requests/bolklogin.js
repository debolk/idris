import {API} from "./api";
import {URLBuilder} from "../helpers/url_builder";
import {Storage} from "../helpers/storage";
import {Request} from "./request";

export class Bolklogin extends API {

    static getAccessToken() {
        return Storage.getVariable(Storage.STORAGE.ACCESS_TOKEN_STORAGE);
    }

    static requestToken(json){
        new Request(Request.RequestType.POST,
            Storage.LOGIN_ADDRESS + "token", (status, response) => {
            if ( status === 200 ){
                let data = JSON.parse(response);
                let access = data[Storage.PARAMETERS.ACCESS_TOKEN];
                let refresh = data[Storage.PARAMETERS.REFRESH_TOKEN];
                let expires = parseInt(data[Storage.PARAMETERS.EXPIRES]);

                Storage.debug("Validating token...");

                this.validateToken(access, refresh, expires);

            }
        }, json);
    }

    static login() {

        Storage.debug("Logging in...");

        let login_state = this.checkLoginState();

        if ( !(location.href.includes("/login")) && !login_state ) {

            let uri = new URLBuilder(Storage.LOGIN_ADDRESS)
                .path("authenticate")
                .parameter("response_type", "code")
                .parameter("client_id", Storage.CLIENT_ID)
                .parameter("redirect_uri", Storage.APP_REDIRECT_ADDRESS)
                .parameter("state", this.getStateID())
                .build();

            location.replace(uri);

        } else if ( !login_state ) {
            let state = this.getParameter("state");

            if ( state !== this.getStateID() ) {
                if ( state === "1" ) console.log("ERROR"); //TODO: CREATE ERROR PAGE ACCESS DENIED
                else alert("WARNING: THE STATE PARAMETER DID NOT MATCH\nYou might be at risk of a CSRF-attack."); //TODO RESTART PROCESS
            } else {
                this.requestToken({"grant_type": "authorization_code"
                    , "redirect_uri": Storage.APP_REDIRECT_ADDRESS
                    , "code": this.getParameter("code")
                    , "client_id": Storage.CLIENT_ID
                    , "client_secret": Storage.CLIENT_SECRET});
            }
        }

        return false; //TODO is this necessary?
    }

    static validateToken(access_token, refresh_token, expires) {

        new Request(Request.RequestType.GET, new URLBuilder(Storage.LOGIN_ADDRESS)
            .path("resource")
            .parameter(Storage.PARAMETERS.ACCESS_TOKEN, access_token)
            .build(), (status, response) => {
            if (status === 200) {
                let data = JSON.parse(response);

                if (data[Storage.PARAMETERS.ACCESS_TOKEN] === access_token) {

                    let expiry = new Date();
                    expiry.setTime(expiry.getTime() + (expires * 1000));

                    Storage.setVariable(Storage.STORAGE.ACCESS_TOKEN_STORAGE, access_token);
                    Storage.setVariable(Storage.STORAGE.REFRESH_TOKEN_STORAGE, refresh_token);
                    Storage.setVariable(Storage.STORAGE.EXPIRY_TOKEN_STORAGE, expiry.getTime());
                    setTimeout(this.refreshToken, expires * 1000);

                    document.getElementById("content").innerHTML = "<p>Welcome, " + data['user_id'] + "</p>";
                    location.replace(Storage.APP_ADDRESS);
                } else {
                    alert("WARNING: access_token not valid"); //TODO restart process
                }
            }
        })

    }

    static refreshToken() {
        Storage.debug("Refreshing access token...");
        Bolklogin.requestToken({"grant_type": "refresh_token"
            , "refresh_token": Storage.getVariable(Storage.STORAGE.REFRESH_TOKEN_STORAGE)
            , "client_id": Storage.CLIENT_ID
            , "client_secret": Storage.CLIENT_SECRET});
    }

    static checkLoggedIn() {
        if (!this.checkLoginState()) {
            this.login();
            return false;
        }
        return true;
    }

    static checkLoginState() {
        if (Storage.hasVariable(Storage.STORAGE.ACCESS_TOKEN_STORAGE) &&
        Storage.hasVariable(Storage.STORAGE.REFRESH_TOKEN_STORAGE &&
        Storage.hasVariable(Storage.STORAGE.EXPIRY_TOKEN_STORAGE))) {
            Storage.debug(`ACCESS_TOKEN_STORAGE: ${Storage.getVariable(Storage.STORAGE.ACCESS_TOKEN_STORAGE)}`);
            return false;
        }

        let current_date = new Date().getTime();
        let expiry_date = Storage.getVariable(Storage.STORAGE.EXPIRY_TOKEN_STORAGE);

        let logged_in = expiry_date > current_date;
        if (logged_in) {
            let timeout = expiry_date - current_date - 64000;
            Storage.debug("User logged in, setting the refresh timeout.");
            Storage.debug(`Refreshing in ${timeout/1000} seconds`);
            setTimeout(this.refreshToken, timeout);
        }
        return logged_in;
    }

    static async checkAuthorization() {
        new Request(
            Request.RequestType.POST, new URLBuilder(Storage.LOGIN_ADDRESS)
                .path("bestuur")
                .access_token(Bolklogin.getAccessToken())
                .build(),
            (status, response) => {
                return status === 200;
            });
    }
}