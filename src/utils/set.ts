type Indexed<T = unknown> = {
    [key in string]: T;
};

function set(object: Indexed | unknown, path: string, value: unknown): Indexed | unknown {
    if (!(object instanceof Object)) {
        return object;
    }
    const props = path.split('.');
    let o = object as Indexed;
    props.forEach((p, i) => {
        if (i === (props.length - 1)) {
            o[p] = value;
        } else if (o[p] === undefined) {
            o[p] = {} as Indexed;
        }
        o = o[p] as Indexed;
    });
    return object;
}

export default set;
