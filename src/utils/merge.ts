type Indexed<T = unknown> = {
    [key in string]: T;
};

function merge(lhs: Indexed, rhs: Indexed): Indexed {
    const merged: Indexed = { ...lhs };
    Object.keys(rhs).forEach((key) => {
        if (rhs[key] instanceof Object) {
            if (lhs[key] && lhs[key] instanceof Object) {
                merged[key] = merge(lhs[key] as Indexed, rhs[key] as Indexed);
            } else {
                merged[key] = rhs[key];
            }
        } else if (lhs[key] === undefined) {
            merged[key] = rhs[key];
        }
    });
    return merged;
}

export default merge;
