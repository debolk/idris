import {Blip} from "../requests/blip";
import {Storage} from "./storage";

export class URLBuilder {

    constructor(url) {
        if (!url.toString().endsWith("/")) url += "/";

        this.url = url;
        this.params = [];
        this.paths = [];
    }

    access_token(token) {
        return this.parameter(Storage.PARAMETERS.ACCESS_TOKEN, token);
    }

    parameter(param, value) {
        this.params.push(`${param.toString()}=${value.toString()}`);
        return this;
    }

    path(path) {
        if (path.toString().startsWith("/")) path = path.toString().substring(1);
        if (path.toString().endsWith("/")) path = path.toString().substring(0, path.length - 1);

        this.paths.push(path);
        return this;
    }

    buildPaths() {
        this.paths.forEach((p, i) => {
            if (!this.url.endsWith("/")) this.url += "/" + p;
            else this.url += p;
        });
    }

    buildParameters() {
        if (this.params.length > 0) this.url += "?";
        this.params.forEach((v, i) => {
            if (i !== this.params.length - 1) {
                this.url += v.toString() + "&";
            } else {
                this.url += v.toString();
            }
        })
    }

    build() {
        this.buildPaths();
        this.buildParameters();
        return this.url;
    }

}