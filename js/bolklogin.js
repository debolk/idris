import {URLBuilder} from "./classes/requests/URLBuilder.js";
import {API} from "./classes/requests/api.js";
import {Request} from "./classes/requests/request.js";
import {Blip} from "./blip.js"

export class Bolklogin extends API {

    static token(json){
        new Request(Request.RequestType.POST,
            Bolklogin.LOGIN_ADDRESS + "token", (status, response) => {
            if ( status === 200 ){
                let res = JSON.parse(response);
                let access = res[Bolklogin.VAR_NAMES.ACCESS_TOKEN];
                let refresh = res[Bolklogin.VAR_NAMES.REFRESH_TOKEN];
                let expires = parseInt(res[Bolklogin.VAR_NAMES.EXPIRES]);

                console.log("Validating token...");

                this.validate(access, refresh, expires);

            }
        }, json);
    }

    static login() {

        console.log("Logging in...");

        if ( !(location.href.includes("/login")) && !this.checkLoginState() ) {
            console.log("Redirect?");
            let uri = new URLBuilder(Bolklogin.LOGIN_ADDRESS)
                .request("authenticate")
                .parameter("response_type", "code")
                .parameter("client_id", Bolklogin.CLIENT_ID)
                .parameter("redirect_uri", Bolklogin.APP_ADDRESS)
                .parameter("state", this.getStateID())
                .build();
            location.replace(uri);

        } else if ( !this.checkLoginState() ) {
            let state = this.getParameter(Bolklogin.VAR_NAMES.STATE);

            if ( state !== this.getStateID() ) {
                if ( state === "1" ) console.log("ERROR"); //TODO: CREATE ERROR PAGE ACCESS DENIED
                else alert("WARNING: THE STATE PARAMETER DID NOT MATCH\nYou might be at risk of a CSRF-attack."); //TODO RESTART PROCESS
            } else {
                this.token({"grant_type": "authorization_code"
                    , "redirect_uri": Bolklogin.APP_ADDRESS
                    , "code": this.getParameter("code")
                    , "client_id": Bolklogin.CLIENT_ID
                    , "client_secret": Bolklogin.CLIENT_SECRET});
            }
        }

        return false;
    }

    static validate(access_token, refresh_token, expires) {


        new Request(Request.RequestType.GET, new URLBuilder(Bolklogin.LOGIN_ADDRESS)
            .request("resource")
            .parameter(Bolklogin.VAR_NAMES.ACCESS_TOKEN, access_token)
            .build(), (status, response) => {
            if (status === 200) {
                let res = JSON.parse(response);

                if (res[Bolklogin.VAR_NAMES.ACCESS_TOKEN] === access_token) {

                    let expiry = new Date();
                    expiry.setTime(expiry.getTime() + (expires * 1000));

                    this.setVariable(Bolklogin.VAR_NAMES.ACCESS_TOKEN_STORAGE, access_token);
                    this.setVariable(Bolklogin.VAR_NAMES.REFRESH_TOKEN_STORAGE, refresh_token);
                    this.setVariable(Bolklogin.VAR_NAMES.EXPIRY_TOKEN_STORAGE, expiry.getTime());
                    setTimeout(this.refresh, expires * 1000);

                    document.getElementById("content").innerHTML = "<p>Welcome, " + res['user_id'] + "</p>";
                    location.replace(API.APP_ADDRESS.replace('/login', ''));
                } else {
                    alert("WARNING: access_token not valid"); //TODO restart process
                }
            }
        })
    }

    static refresh() {
        this.token({"grant_type": "refresh_token"
            , "refresh_token": this.getVariable(this.VAR_NAMES.REFRESH_TOKEN_STORAGE)
            , "client_id": Bolklogin.CLIENT_ID
            , "client_secret": Bolklogin.CLIENT_SECRET});
    }

}