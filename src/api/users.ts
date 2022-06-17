import { User, IUser } from '../modules/user';
import { BaseAPI } from './base';

export class UsersAPI extends BaseAPI {
    public async getUserById(id: number): Promise<User> {
        const url = `${this.baseURL}/user/${id}`;
        const response = await this.http.get(url, {
            credentials: true,
            headers: {
                'content-type': 'application/json',
            },
        });
        return new User(JSON.parse(response.responseText));
    }

    public async searchUserByLogin(login: string): Promise<User[]> {
        const url = `${this.baseURL}/user/search`;
        const response = await this.http.post(url, {
            credentials: true,
            headers: {
                'content-type': 'application/json',
            },
            data: {
                login,
            },
        });
        return JSON.parse(response.responseText).map((u: IUser) => new User(u));
    }

    public async getUsersByChat(id: number): Promise<User[]> {
        const url = `${this.baseURL}/chats/${id}/users`;
        const response = await this.http.get(url, {
            credentials: true,
            headers: {
                'content-type': 'application/json',
            },
        });
        return JSON.parse(response.responseText).map((u: IUser) => new User(u));
    }
}

export default { UsersAPI };
