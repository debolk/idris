import {API} from "./classes/requests/api.js";
import {Request} from "./classes/requests/request.js";
import {URLBuilder} from "./classes/requests/URLBuilder.js";
import {Person} from "./classes/person.js";

export class Blip extends API {

    static getAll(request, callback) {
        new Request(Request.RequestType.GET, new URLBuilder(this.BLIP_ADDRESS)
            .request(request)
            .parameter(this.VAR_NAMES.ACCESS_TOKEN, this.getAccessToken())
            .build(), (status, response) => {
            if (status === 200) {
                callback(response);
            }
        });
    }

    static getAllMembers(callback) {
        Blip.getAll("members", callback);
    }

    static getCurrentMembers(callback) {
        Blip.getAll("members/current", callback);
    }

    static getFormerMembers(callback) {
        Blip.getAll("members/former", callback);
    }

    static getCandidateMembers(callback) {
        Blip.getAll("members/candidate", callback);
    }

    static newPersons() {

    }

    static getPerson(uid, callback) {
        new Request(Request.RequestType.GET, new URLBuilder(this.BLIP_ADDRESS)
            .path("person")
            .request("uid")
            .parameter(this.VAR_NAMES.ACCESS_TOKEN, this.getAccessToken())
            .build(), (status, response) =>{
            if (status === 200) {
                callback(response);
            }
        });
    }

    static patchPerson(uid, data) {
        new Request(Request.RequestType.PATCH, new URLBuilder(this.BLIP_ADDRESS)
            .path("person")
            .path(uid)
            .request("update")
            .parameter(this.VAR_NAMES.ACCESS_TOKEN, this.getAccessToken())
            .build(), (status, response) => {
            if (status === 200) {
                console.log(response);
            }
        }, data);
    }

}