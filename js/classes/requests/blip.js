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

    static getPersonPhoto(uid, callback) {
        let url = new URLBuilder(Storage.BLIP_ADDRESS)
            .path("person")
            .path(uid)
            .path("photo")
            .access_token(Bolklogin.getAccessToken())
            .build();

        new Request(Request.RequestType.GET, url, (status, response) => {
            if (status === 200) {
                let reader = new FileReader();
                reader.readAsDataURL(response);
                reader.onloadend = function() {
                    callback(reader.result);
                }
            } else {
                callback(Storage.BROKEN_IMAGE);
            }
        }, null, 10000, false);
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
            } else {
                Storage.display_error("Could not find the person!");
            }
        });
    }

    static getPersonBasic(uid, callback) {
        let url = new URLBuilder(Storage.BLIP_ADDRESS)
            .path("person")
            .path(uid)
            .access_token(Bolklogin.getAccessToken())
            .build();

        new Request(Request.RequestType.GET, url, (status, response) => {
           callback(status, response);
        });
    }

    static patchPerson(uid, data, callback = null) {
        console.debug(data);
        new Request(Request.RequestType.PATCH, new URLBuilder(Storage.BLIP_ADDRESS)
            .path("person")
            .path(uid)
            .path("update")
            .access_token(Bolklogin.getAccessToken())
            .build(), (status, response) => {
            if (callback != null) callback(status, response);
        }, data);
    }

    static patchPassword(uid, data, callback = null) {
        console.debug(data);
        new Request(Request.RequestType.PATCH, new URLBuilder(Storage.BLIP_ADDRESS)
            .path("person")
            .path(uid)
            .path("password")
            .access_token(Bolklogin.getAccessToken())
            .build(), (status, response) => {
            if (callback != null) callback(status, response);
        }, data);
    }

    static newPerson(data, callback = null) {
        console.debug(data);
        new Request(Request.RequestType.POST, new URLBuilder(Storage.BLIP_ADDRESS)
            .path("person")
            .access_token(Bolklogin.getAccessToken())
            .build(), (status, response) => {
           if (callback != null) callback(status, response);
        }, data);
    }

    static deletePerson(uid, callback = null) {
        console.debug(uid);
        new Request(Request.RequestType.DELETE, new URLBuilder(Storage.BLIP_ADDRESS)
            .path("person")
            .path(uid)
            .access_token(Bolklogin.getAccessToken())
            .build(), (status, response) => {
           if (callback != null) callback(status, response);
        });
    }
}