//redirect to https://<LOGIN ADDRESS/IP>/authenticate?response_type=code&client_id=<ID>&redirect_uri=https://<APP ADDRESS/IP>&state=<state>
// <state> must be randomly generated

// server will redirect with "code" and "state"
// if login failed, the response will be ?error=access_denied&error_description=<DESC>&state=1
// the state must remain the same in the response
// send POST to server: https://<LOGIN ADDRESS/IP>/token
// attach the following data as JSON (remember Content-Type: application/json)
// {"grant_type":"authorization_code", "redirect_uri":"https://<APP ADDRESS/IP>/", "code":<CODE>, "client_id": <CLIENT_ID>, "client_secret": <CLIENT_SECRET> }

// server will respond with "access_token"
// validate with POST to "https://<LOGIN ADDRESS/IP>/resource/?access_token=<ACCESS_TOKEN>
// if the token is valid the server will return the "access_token", "user_id" & "expires" (which tells when the token expires).
// if it's invalid, return 403 Unauthorized header and pass the error codes to the body.

// refresh if the token almost expires
// sent POST to "https://<AUTH ADDRESS/IP>/token/
// with payload: { "grant_type": "refresh_token", "refresh_token", <refresh_token>, "client_id": <CLIENT_ID>, "client_secret": <CLIENT_SECRET> }

// server will return new token; overwrite old one!

// user should have "bestuur" auth level
// send POST to "https://<LOGIN ADDRESS/IP?/bestuur/?access_token=<ACCESS_TOKEN>
// it will reply 200 OK if the user is authorized

class Bolklogin extends API {

    login() {

        if ( !this.checkLoginState() ) {
            location.replace(Bolklogin.LOGIN_ADDRESS + "authenticate?response_type=code&client_id" + Bolklogin.CLIENT_ID + "&redirect_uri=http://10.99.1.105:8008?state=" + this.getStateID());
        }

        return false;
    }

}
