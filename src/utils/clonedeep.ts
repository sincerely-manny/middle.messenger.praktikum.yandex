function cloneDeep<T extends object = object>(obj: T) {
    let clone: any;
    if (Array.isArray(obj)) {
        clone = [] as T;
    } else {
        clone = {} as T;
    }
    Object.entries(obj).forEach(([key, value]) => {
        if (Array.isArray(Object) || value instanceof Object) {
            clone[key] = cloneDeep(value);
        } else {
            clone[key] = value;
        }
    });
    return clone;
}
export default cloneDeep;
