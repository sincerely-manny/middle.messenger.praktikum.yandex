function isArray(value: unknown): value is [] {
    return Array.isArray(value);
}

  type PlainObject<T = unknown> = {
      [k in string]: T;
  };

function isPlainObject(value: unknown): value is PlainObject {
    return typeof value === 'object'
      && value !== null
      && value.constructor === Object
      && Object.prototype.toString.call(value) === '[object Object]';
}

function isArrayOrObject(value: unknown): value is ([] | PlainObject) {
    return isPlainObject(value) || isArray(value);
}

function isEqual(lhs: PlainObject, rhs: PlainObject) {
    // Сравнение количества ключей объектов и массивов
    if (Object.keys(lhs).length !== Object.keys(rhs).length) {
        return false;
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(lhs)) {
        const rightValue = rhs[key];
        if (isArrayOrObject(value) && isArrayOrObject(rightValue)) {
            if (!isEqual(value as PlainObject, rightValue as PlainObject)) {
                return false;
            }
        } else if (value !== rightValue) {
            return false;
        }
    }

    return true;
}

export default isEqual;
