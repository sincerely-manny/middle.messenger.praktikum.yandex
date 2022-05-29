// файл описывает типы данных и глобальный объект с данными
// import { data } from './testData';
import { User } from './user';
import { Chat } from '../blocks/chat';
import { users } from '../models/dummy_data/users';
import { chats } from '../models/dummy_data/chats';
import { TE } from './templatebike';

// сортируем рандомно сгенерированные чаты по дате (пока так)
chats.forEach((e) => {
    e.messages.sort((a, b) => {
        const r: number = a.timestamp - b.timestamp;
        return r;
    });
});

chats.sort((a, b) => {
    const r: number = b.messages[b.messages.length - 1].timestamp
    - a.messages[a.messages.length - 1].timestamp;
    return r;
});

type ApplicationData = {
    user: User,
    chats: any[],
    getChat: (user_id: number) => Chat,
    runtime: { [key: string]: any },
};

const applicationData: ApplicationData = {
    user: new Proxy(users[0], {
        get(target: User, key: keyof User) {
            return target[key];
        },
        set<T extends keyof User>(target: User, key: T, value: User[T]) {
            if (key in target) {
                // eslint-disable-next-line no-param-reassign
                target[key] = value;
            } else {
                throw new Error('access denied (create new prop)');
            }
            return true;
        },
    }),
    runtime: {},
    chats,
    getChat: (user_id: number) => {
        const chat = applicationData.chats?.find((e) => ((e.user_id === user_id) ? e : false));
        return chat || {} as Chat;
    },
};

// applicationData.chats = chats.map(
//     (e) => new Chat(
//         e.user_id,
//         e.messages as Message[],
//         applicationData.user,
//     ),
// );

export const appData = new Proxy(applicationData, {
    get(target, key) {
        return target[key as keyof typeof target];
    },
    set() {
        throw new Error('access denied');
    },
});

// eslint-disable-next-line no-new
TE.data = appData;

export default { appData };
