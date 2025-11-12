import {API} from "/js/classes/requests/api.js";
import {Request} from "/js/classes/requests/request.js";
import {Storage} from "/js/classes/helpers/storage.js";
import {Bolklogin} from "/js/classes/requests/bolklogin.js";
import {URLBuilder} from "/js/classes/helpers/url_builder.js";

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

    static getAllBasic(callback) {
        new Request(Request.RequestType.GET, new URLBuilder(Storage.BLIP_ADDRESS)
            .path('/persons')
            .access_token(Bolklogin.getAccessToken())
            .build(), (status, response) => {
            if (status === 200) {
                callback(response);
            } else {
                console.error(status, response);
            }
        })
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
                    console.debug(reader.result);
                    callback(reader.result);
                }
            } else {
                callback(Storage.BROKEN_IMAGE);
            }
        }, null, 10000, false);
    }

    static getPhotos(uids, callback) {
        if (Array.isArray(uids)) {
            uids = uids.join();
        }
        let url = new URLBuilder(Storage.BLIP_ADDRESS)
            .path("persons")
            .path("photo")
            .parameter("users", uids)
            .access_token(Bolklogin.getAccessToken())
            .build();
        
        new Request(Request.RequestType.GET, url, (status, response) => {
                callback(status, response);
        })
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
                Storage.display_error(`Could not find ${uid}!`);
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

    static patchResetPassword(uid, callback = null) {
        new Request(Request.RequestType.PATCH, new URLBuilder(Storage.BLIP_ADDRESS)
            .path("person")
            .path(uid)
            .path("resetpassword")
            .access_token(Bolklogin.getAccessToken())
            .build(), (status, response) => {
            if (callback != null) callback(status, response);
        });
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