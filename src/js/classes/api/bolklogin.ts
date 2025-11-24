import { API } from "./api";
import { URLBuilder } from "../url_builder";
import { Callback, Request } from "./request";
import { ADDRESSES, PARAMETERS, Shared, STORAGE_KEYS } from "../share";

export class Bolklogin extends API {

    static restart_process() {
        console.warn("Restarting login process...");
        Shared.clear_storage();
        location.replace(ADDRESSES.APP);
    }

    static get_access_token(): string {
        return Shared.get_var(STORAGE_KEYS.ACCESS_TOKEN_STORAGE);
    }

    static request_token(json: any){
        let request = new Request("POST", new URLBuilder(ADDRESSES.AUTH)
            .path("token")
            .build(), json
        );

        request.open((status, response) => {
            if (status === 200) {
                let access_token: string = response[PARAMETERS.ACCESS_TOKEN];
                let refresh_token: string = response[PARAMETERS.REFRESH_TOKEN];
                let expires_in: number = response[PARAMETERS.EXPIRES];

                console.debug("Validating token...");

                this.validate_token(access_token, refresh_token, expires_in);
            }
        });
    }

    static login(redirected = false) {

        console.debug("Logging in...");

        let login_state = this.check_login_state();

        if ( !redirected && !login_state ) {

            let url = new URLBuilder(ADDRESSES.AUTH)
                .path("authorize")
                .parameter("response_type", "code")
                .parameter("client_id", Shared.CLIENT_ID)
                .parameter("redirect_uri", ADDRESSES.APP_REDIRECT)
                .parameter("state", this.get_stateid())
                .build();
            
            location.replace(url);
            return false;

        } else if ( !login_state ) {

            let state = this.get_parameter("state");

            if ( state !== this.get_stateid() ) {
                if ( state === "1" ) {
                    Shared.display_error("You denied authorization");
                    return false;
                } else {
                    alert("WARNING: THE STATE PARAMETER DID NOT MATCH\nYou might be at risk of a CSRF-attack.");
                    this.restart_process();
                    return false;
                }
            } else {
                this.request_token({"grant_type": "authorization_code",
                    "redirect_uri": ADDRESSES.APP_REDIRECT,
                    "code": this.get_parameter("code"),
                    "client_id": Shared.CLIENT_ID,
                    "client_secret": Shared.CLIENT_SECRET});
            }
        }

        return login_state;
    }

    static validate_token(access_token: string, refresh_token: string, expires: number) {
        let request = new Request("GET", new URLBuilder(ADDRESSES.AUTH)
            .path("resource")
            .parameter(PARAMETERS.ACCESS_TOKEN, access_token)
            .build()
        );

        request.open((status, response) => {
            if (status === 200) {
                if (response[PARAMETERS.ACCESS_TOKEN] === access_token) {
                    let expiry = new Date();
                    expiry.setTime(expiry.getTime() + (expires * 1000));

                    Shared.set_var(STORAGE_KEYS.ACCESS_TOKEN_STORAGE, access_token);
                    Shared.set_var(STORAGE_KEYS.REFRESH_TOKEN_STORAGE, refresh_token);
                    Shared.set_var(STORAGE_KEYS.EXPIRY_TOKEN_STORAGE, expiry.getTime());
                    Shared.set_var(STORAGE_KEYS.USER_ID, response[PARAMETERS.USER_ID]);

                    setTimeout(this.refresh_token, expires * 1000 - 64000);

                    location.replace(ADDRESSES.APP);

                } else {
                    alert("WARNING: access token not valid");
                    this.restart_process();
                }
            } else {
                console.debug(response);
                Shared.display_error("ERROR: login failed, please try again.");
            }
        });
    }

    static refresh_token() {
        console.debug("Refreshing access token...");
        Bolklogin.request_token({"grant_type": "refresh_token",
            "refresh_token": Shared.get_var(STORAGE_KEYS.REFRESH_TOKEN_STORAGE),
            "client_id": Shared.CLIENT_ID,
            "client_secret": Shared.CLIENT_SECRET});
    }

    static is_logged_in() {
        if (!this.check_login_state()) {
            if (location.href.startsWith(ADDRESSES.APP_REDIRECT)) {
                return this.login(true);
            }
            alert("Welcome to I.D.R.I.S.\nPlease press OK to log in.");
            this.login();
            return false;
        }
        return true;
    }

    static check_login_state() {
        if (!Shared.has_var(STORAGE_KEYS.ACCESS_TOKEN_STORAGE) ||
            !Shared.has_var(STORAGE_KEYS.REFRESH_TOKEN_STORAGE) ||
            !Shared.has_var(STORAGE_KEYS.EXPIRY_TOKEN_STORAGE)
        ) return false;

        let current_date = new Date().getTime();
        let expiry_date: number = Shared.get_var(STORAGE_KEYS.EXPIRY_TOKEN_STORAGE);
        
        let logged_in = expiry_date > current_date;
        if (logged_in) {
            let timeout = expiry_date - current_date - 64000;
            console.debug("User logged in, setting the refresh timeout.");
            console.debug(`Refreshing in ${timeout/1000} seconds`);
            setTimeout(this.refresh_token, timeout);
        }
        return logged_in;
    }

    static logout(){
        if (this.check_login_state()) {
            Shared.clear_storage();
            location.replace(ADDRESSES.APP);
        }
    }

    static check_authorization(callback: Callback) {
        let request = new Request("POST", new URLBuilder(ADDRESSES.AUTH)
            .path("bestuur")
            .access_token(Bolklogin.get_access_token())
            .build()
        );
        
        request.open(callback);
    }
}