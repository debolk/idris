export class URLBuilder {

    constructor(url) {
        this.url = url;
        this.params = [];

        if (!this.url.toString().endsWith("/")) {
            this.url += "/";
        }
    }

    parameter(param, value) {
        this.params.push(param.toString() + "=" + value.toString());
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