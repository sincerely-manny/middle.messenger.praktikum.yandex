import { Chat } from '../blocks/chat';
import { AppEvent, ETB } from './eventbus';
import { User } from './user';

export class AppData {
    private static instance: AppData;

    private _user?: User;

    private _chats?: Chat[];

    // private _runtime: Record<string, any> = {};

    constructor() {
        if (AppData.instance) {
            return AppData.instance;
        }
        AppData.instance = this;
    }

    get user() {
        if (this._user) {
            return this._user;
        }
        throw new Error('User is not set');
    }

    set user(data: User) {
        this._user = data;
        ETB.trigger(AppEvent.USERDATA_Updated);
    }

    public deleteUser() {
        this._user = undefined;
    }

    get chats() {
        if (this._chats) {
            return this._chats;
        }
        throw new Error('No chats were fetched');
    }

    set chats(data: Chat[]) {
        this._chats = data;
    }
}

export const appData = new AppData();

export default { AppData, appData };
