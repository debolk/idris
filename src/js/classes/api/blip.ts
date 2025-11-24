import { API } from "./api";
import { Callback, Request, ResponseType } from "./request";
import { Bolklogin } from "./bolklogin";
import { URLBuilder } from "../url_builder";
import { ADDRESSES } from "../share";
import { IPerson } from "../person";

export class Blip extends API {

    static get_request(path:string, callback: Callback, response_type: ResponseType = ResponseType.JSON) {
        let request = new Request("GET", new URLBuilder(ADDRESSES.BLIP)
            .path(path)
            .access_token(Bolklogin.get_access_token())
            .build()
        )
        request.open(callback, response_type);
    }

    static get_all(callback: Callback) {
        this.get_request("/persons/all", callback);
    }

    static get_all_basic(callback: Callback) {
        this.get_request("/persons", callback);
    }

    static get_person_photo(uid: string, callback: Callback) {
        this.get_request(`/person/${uid}/photo`, callback, ResponseType.BLOB);
    }

    static get_multiple_photos(uids: string[] | string, callback: Callback) {
        if (Array.isArray(uids)) {
            uids = uids.join(',');
        }
        let url = new URLBuilder(ADDRESSES.BLIP)
            .path("persons")
            .path("photo")
            .parameter("users", uids)
            .access_token(Bolklogin.get_access_token())
            .build();
        let request = new Request("GET", url);
        request.open(callback);
    }

    static get_person(uid: string, callback: Callback) {
        this.get_request(`/person/${uid}/all`, callback)
        // new Request(Request.RequestType.GET, url, (status, response) =>{
        //     if (status === 200) {
        //         callback(response);
        //     } else {
        //         Storage.display_error(`Could not find ${uid}!`);
        //     }
        // });
    }

    static update_person(uid: string, data: IPerson, callback?: Callback) {
        let request = new Request("PATCH", new URLBuilder(ADDRESSES.BLIP)
            .path("person")
            .path(uid)
            .path("update")
            .access_token(Bolklogin.get_access_token())
            .build(), data
        )
        request.open((s, r) => {
            if (callback !== undefined) callback(s, r);
        });
    }

    static reset_password(uid: string, callback?: Callback) {
        let request = new Request("PATCH", new URLBuilder(ADDRESSES.BLIP)
            .path("person")
            .path(uid)
            .path("resetpassword")
            .access_token(Bolklogin.get_access_token())
            .build()
        );
        request.open((s, r) => {
            if (callback !== undefined) callback(s, r);
        });
    }

    static new_person(data: IPerson, callback?: Callback) {
        let request = new Request("POST", new URLBuilder(ADDRESSES.BLIP)
            .path("person")
            .access_token(Bolklogin.get_access_token())
            .build(), data
        );
        
        request.open((s, r) => {
            if (callback !== undefined) callback(s, r);
        });
    }

    static delete_person(uid: string, callback?: Callback) {
        let request = new Request("DELETE", new URLBuilder(ADDRESSES.BLIP)
            .path("person")
            .path(uid)
            .access_token(Bolklogin.get_access_token())
            .build()
        )

        request.open((s, r) => {
            if (callback !== undefined) callback(s, r);
        });
    }
}