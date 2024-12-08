export class Request {

    static RequestType = {"POST": "POST", "PATCH": "PATCH", "GET": "GET"};

    constructor(type, url, callback, json = null) {
        let request = new XMLHttpRequest();

        request.open(type, url);
        request.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        request.setRequestHeader("Accept","application/json");

        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                callback(request.status, request.responseText);
            }
        }
        if (json != null) request.send(JSON.stringify(json));
        else request.send();
    }
}
