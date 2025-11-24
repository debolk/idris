import { URLBuilder } from "../url_builder";

export type Callback = (status: number, response: any) => void;

export enum ResponseType {
    TEXT,
    BLOB,
    JSON
}

export class Request {

    private type: "POST" | "PATCH" | "GET" | "DELETE";
    private url: string;
    private requestinit: RequestInit;

    constructor(type: "POST" | "PATCH" | "GET" | "DELETE", url: string | URLBuilder, body?: any, timeout: number = 5000) {
        if (typeof url !== "string") {
            this.url = url.build();
        } else {
            this.url = url;
        }
        this.type = type;

        this.requestinit = {
            method: this.type,
            signal: AbortSignal.timeout(timeout)
        };

        if (body !== undefined) {
            this.requestinit.body = JSON.stringify(body);
            this.requestinit.headers = {
                "Content-Type": "application/json; charset=UTF-8"
            };
        }

    }

    async open(callback: Callback, response_type: ResponseType = ResponseType.JSON) {
        
        try {
            const response = await fetch(this.url, this.requestinit);

            console.debug(`Opened connection to ${this.url}`);

            if (response.ok) {
                const status = response.status;
                
                console.debug(`Received response\n ${status}: ${response.statusText}`);
                
                let data: any;
                switch (response_type) {
                    case ResponseType.BLOB:
                        data = await response.blob();
                        break;
                    case ResponseType.JSON:
                        data = await response.json();
                        break;
                    case ResponseType.TEXT:
                        data = await response.text();
                        break;
                }
                callback(status, data);
            } else {
                callback(response.status, response.statusText);
            }
            
        } catch(err: unknown) {

            if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
                console.error("Server timed out.");
                callback(408, "Server timed out.");
            } else {
                console.error(err);
            }
        }
    }
}
