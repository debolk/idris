import {API} from "./classes/requests/api.js";
import {Request} from "./classes/requests/request.js";
import {URLBuilder} from "./classes/requests/URLBuilder.js";

export class Blip extends API {

    static BLIP_ADDRESS = "http://10.99.1.105:8001";

    static getAllPersons() {
        new Request(Request.RequestType.GET, new URLBuilder(this.BLIP_ADDRESS)
            .request("persons")
            .parameter(this.VAR_NAMES.ACCESS_TOKEN, this.getAccessToken())
            .build(), (status, response) => {
            if (status === 200) {
                console.log(response);
            }
        });
    }

    static patchPerson(uid, data) {
        new Request(Request.RequestType.PATCH, new URLBuilder(this.BLIP_ADDRESS)
            .path("person")
            .path(uid)
            .path("update")
            .parameter(this.VAR_NAMES.ACCESS_TOKEN, this.getAccessToken())
            .build(), (status, response) => {
            if (status === 200) {
                console.log(response);
            }
        }, data);
    }

}