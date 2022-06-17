type StringIndexed = Record<string, any>;

function queryStringify(data: StringIndexed): string | never {
    if (!(data instanceof Object)) {
        throw new Error('input must be an object');
    }
    const queryArray: {
        path: Array<string>,
        val: string,
    }[] = [];

    const qs = (d: any, _k?: string, path: Array<string> = []) => {
        if (d instanceof Object) {
            Object.entries(d).forEach(([key, value]) => {
                const p = [...path, key];
                qs(value, key, p);
            });
        } else {
            queryArray.push({
                path,
                val: encodeURIComponent(d.toString()),
            });
        }
    };
    qs(data);

    return queryArray.map((e) => {
        let s = e.path[0];
        e.path.slice(1).forEach((k) => {
            s = `${s}[${k}]`;
        });
        s = `${s}=${e.val}`;
        return s;
    }).join('&');
}

export default queryStringify;
