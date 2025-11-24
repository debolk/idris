import { PARAMETERS } from "./share";

export class URLBuilder {

    url: string;
    params: string[] = [];
    paths: string[]  = [];

    constructor(url: string) {
        if (!url.endsWith("/")) url += "/";

        this.url = url;
    }

    access_token(token: string) {
        return this.parameter(PARAMETERS.ACCESS_TOKEN, token);
    }

    parameter(param: string, value: any) {
        this.params.push(`${param}=${value.toString()}`);
        return this;
    }

    path(path: string) {
        if (path.startsWith("/")) path = path.substring(1);
        if (path.endsWith("/")) path = path.substring(0, path.length - 1);

        this.paths.push(path);
        return this;
    }

    private build_paths() {
        this.paths.forEach((p, i) => {
            if (!this.url.endsWith("/")) this.url += "/" + p;
            else this.url += p;
        });
    }

    private build_params() {
        if (this.params.length > 0) this.url += "?";
        this.params.forEach((v, i) => {
            if (i !== this.params.length - 1) {
                this.url += v.toString() + "&";
            } else {
                this.url += v.toString();
            }
        })
    }

    build(): string {
        this.build_paths();
        this.build_params();
        return this.url;
    }

}