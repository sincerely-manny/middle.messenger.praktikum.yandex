import getBase64Image from '../utils/imgbase64';

export interface IUser {
    id: number,
    first_name: string,
    second_name: string,
    login: string,
    display_name?: string,
    email: string,
    password?: string | null,
    phone: string,
    avatar?: string,
}

export class User implements IUser {
    id!: number;

    first_name!: string;

    second_name!: string;

    login!: string;

    display_name?: string | undefined;

    email!: string;

    password?: string | null | undefined;

    phone!: string;

    private _avatar?: string | undefined;

    private _avatarBase64?: Promise<string>;

    constructor(data: IUser) {
        Object.assign(this, data);
    }

    get display_name_shown() {
        return this.display_name || `${this.first_name} ${this.second_name}`;
    }

    get avatar() {
        return this._avatar;
    }

    set avatar(url: string | undefined) {
        this._avatar = url;
        if (url) {
            this._avatarBase64 = getBase64Image(url);
        }
    }

    get avatarBase64() {
        return this._avatarBase64;
    }
}

export default { User };
