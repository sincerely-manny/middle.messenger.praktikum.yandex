const METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
};

type Options = {
    headers?: {
        [s: string]: string
    },
    data?: {
        [s: string]: string
    },
    timeout?: number,
    method?: typeof METHODS[keyof typeof METHODS],
};

export default class HTTPTransport {
    get(url: string, options: Options) {
        let queryString: string = '';
        if (options.data) {
            queryString = Object.entries(options.data)
                .map((e) => e.join('='))
                .join('&');
        }
        return this.request(
            `${url}?${queryString}`,
            { ...options, method: METHODS.GET },
            options.timeout,
        );
    }

    put(url: string, options: Options) {
        return this.request(
            url,
            { ...options, method: METHODS.PUT },
            options.timeout,
        );
    }

    post(url: string, options: Options) {
        return this.request(
            url,
            { ...options, method: METHODS.POST },
            options.timeout,
        );
    }

    delete(url: string, options: Options) {
        return this.request(
            url,
            { ...options, method: METHODS.DELETE },
            options.timeout,
        );
    }

    // eslint-disable-next-line class-methods-use-this
    request(url: string, options: Options, timeout = 5000) {
        let { method } = options;
        const { data } = options;

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            if (!method) {
                method = METHODS.GET;
            }
            xhr.open(method, url);
            xhr.timeout = timeout;
            if (options.headers) {
                Object.entries(options.headers).forEach((h) => {
                    xhr.setRequestHeader(h[0], h[1]);
                });
            }

            xhr.onload = () => {
                resolve(xhr);
            };

            xhr.onabort = reject;
            xhr.onerror = reject;
            xhr.ontimeout = reject;

            if (method === METHODS.GET || !data) {
                xhr.send();
            } else {
                xhr.send(JSON.stringify(data));
            }
        });
    }
}
