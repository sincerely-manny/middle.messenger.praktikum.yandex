enum METHODS {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}

type Options = {
    headers?: Record<string, string>,
    data?: Record<string, string> | FormData,
    timeout?: number,
    method?: typeof METHODS[keyof typeof METHODS],
    credentials?: boolean,
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

    request(url: string, options: Options, timeout = 5000): Promise<XMLHttpRequest> {
        let { method } = options;
        const { credentials, data } = options;

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            if (!method) {
                method = METHODS.GET;
            }
            if (credentials) {
                xhr.withCredentials = credentials;
            }
            xhr.open(method, url);
            xhr.timeout = timeout;
            if (options.headers) {
                Object.entries(options.headers).forEach((h) => {
                    xhr.setRequestHeader(h[0], h[1]);
                });
            }

            xhr.onload = () => {
                // if (xhr.status === 200) {
                //     resolve(xhr);
                // } else {
                //     reject(xhr);
                // }
                resolve(xhr);
            };

            xhr.onabort = reject;
            xhr.onerror = reject;
            xhr.ontimeout = reject;

            if (method === METHODS.GET || !data) {
                xhr.send();
            } else if (data instanceof FormData) {
                xhr.send(data);
            } else {
                xhr.send(JSON.stringify(data));
            }
        });
    }
}
