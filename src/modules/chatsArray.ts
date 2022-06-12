import { AppEvent, ETB } from './eventbus';

export default class ChatsArray<T> extends Array<T> {
    public push(...items: T[]): number {
        const length = super.push(...items);
        ETB.trigger(AppEvent.CHATS_LIST_IS_Updated, {
            fn: 'push',
            chats: items,
        });
        return length;
    }

    public pop() {
        const e = super.pop();
        ETB.trigger(AppEvent.CHATS_LIST_IS_Updated, {
            fn: 'pop',
            chats: [e],
        });
        return e;
    }

    public shift() {
        const e = super.shift();
        ETB.trigger(AppEvent.CHATS_LIST_IS_Updated, {
            fn: 'shift',
            chats: [e],
        });
        return e;
    }

    public unshift(...items: T[]): number {
        const length = super.unshift(...items);
        ETB.trigger(AppEvent.CHATS_LIST_IS_Updated, {
            fn: 'unshift',
            chats: items,
        });
        return length;
    }

    static get [Symbol.species]() {
        return Array;
    }
}
