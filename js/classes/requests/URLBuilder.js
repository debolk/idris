export class URLBuilder {

    constructor(url) {
        if (!url.toString().endsWith("/")) url += "/";

        this.url = url;
        this.params = [];
    }

    parameter(param, value) {
        this.params.push(param.toString() + "=" + value.toString());
        return this;
    }

    path(path) {
        if (path.toString().endsWith("/")) path = path.substring(0, path.length - 1);
        this.url += "/" + path.toString();
        return this;
    }

    request(request) {
        this.url += request.toString() + "?";
        return this;
    }

    build() {
        let uri = this.url;
        this.params.forEach((v, i) => {
            if (i !== this.params.length - 1) {
                uri += v.toString() + "&";
            } else {
                uri += v.toString();
            }
        })
        return uri;
    }

}