enum METHODS {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}

type Options = {
    headers?: Record<string, string>,
    data?: Record<string, string | Array<any> | number> | FormData,
    timeout?: number,
    method?: typeof METHODS[keyof typeof METHODS],
    credentials?: boolean,
    responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text',
};

const defaultOptions: Options = {
    credentials: true,
    headers: {
        'content-type': 'application/json',
    },
};

export default class HTTPTransport {
    get(url: string, options: Options = defaultOptions) {
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

    put(url: string, options: Options = defaultOptions) {
        return this.request(
            url,
            { ...options, method: METHODS.PUT },
            options.timeout,
        );
    }

    post(url: string, options: Options = defaultOptions) {
        return this.request(
            url,
            { ...options, method: METHODS.POST },
            options.timeout,
        );
    }

    delete(url: string, options: Options = defaultOptions) {
        return this.request(
            url,
            { ...options, method: METHODS.DELETE },
            options.timeout,
        );
    }

    request(
        url: string,
        options: Options,
        timeout = 5000,
    ): Promise<XMLHttpRequest> {
        let { method } = options;
        const { credentials, data, responseType } = options;

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            if (!method) {
                method = METHODS.GET;
            }
            if (credentials || credentials === undefined) {
                xhr.withCredentials = true;
            }
            if (responseType) {
                xhr.responseType = responseType;
            }
            xhr.open(method, url);
            xhr.timeout = timeout;
            if (!options.headers) {
                options.headers = {};
            }
            if (!options.headers['content-type']) {
                options.headers['content-type'] = 'application/json';
            }
            Object.entries(options.headers).forEach((h) => {
                xhr.setRequestHeader(h[0], h[1]);
            });

            xhr.onload = () => {
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
