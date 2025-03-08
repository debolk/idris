export class Request {

    static RequestType = {"POST": "POST", "PATCH": "PATCH", "GET": "GET", "DELETE": "DELETE"};

    constructor(type, url, callback, json = null, timeout = 0) {
        let request = new XMLHttpRequest();

        request.open(type, url);
        console.debug(`Opened connection to ${url}`);

        request.timeout = timeout;
        request.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        request.setRequestHeader("Accept","application/json");

        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                console.debug('Received response', request.status, request.statusText);
                callback(request.status, request.responseText);
            }
        }

        request.ontimeout = () => {
            console.error('Server timed out for the request.');
            callback(408, "Server timed out.");
        }

        if (json != null) {
            if (typeof json === "string") {
                request.send(json);
            } else {
                request.send(JSON.stringify(json));
            }
        }
        else request.send();
    }
}
