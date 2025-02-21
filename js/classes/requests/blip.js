import {API} from "./api.js";
import {Request} from "./request.js";
import {Storage} from "../helpers/storage";
import {Bolklogin} from "./bolklogin";
import {URLBuilder} from "../helpers/url_builder";

export class Blip extends API {

    static getAll(callback) {
        new Request(Request.RequestType.GET, new URLBuilder(Storage.BLIP_ADDRESS)
            .path('/persons/all')
            .access_token(Bolklogin.getAccessToken())
            .build(), (status, response) => {
            if (status === 200) {
                callback(response);
            }
        });
    }

    static newPerson() {

    }

    static getPersonPhoto(uid, callback) {
        let url = new URLBuilder(Storage.BLIP_ADDRESS)
            .path("person")
            .path(uid)
            .path("photo")
            .access_token(Bolklogin.getAccessToken())
            .build();

        new Request(Request.RequestType.GET, url, (status, response) => {
            if (status === 200) {
                callback(response);
            } else {
                callback(Storage.BROKEN_IMAGE);
            }
        }, null, 10000);
    }

    static getPerson(uid, callback) {
        let url = new URLBuilder(Storage.BLIP_ADDRESS)
            .path("person")
            .path(uid)
            .path("all")
            .access_token(Bolklogin.getAccessToken())
            .build();

        new Request(Request.RequestType.GET, url, (status, response) =>{
            if (status === 200) {
                callback(response);
            }
        });
    }

    static patchPerson(uid, data, callback = null) {
        console.debug(data, "Blip/patchPerson");
        new Request(Request.RequestType.PATCH, new URLBuilder(Storage.BLIP_ADDRESS)
            .path("person")
            .path(uid)
            .path("update")
            .access_token(Bolklogin.getAccessToken())
            .build(), (status, response) => {
            if (callback != null) callback(status, response);
        }, data);
    }

}