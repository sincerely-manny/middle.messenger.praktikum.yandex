import { IUser, User } from '../modules/user';
import { BaseAPI } from './base';

export type UserinfoResponse = User & {
    reason?: string,
};

export type UpdateUserData = Pick<IUser, 'first_name' | 'second_name' | 'login' | 'display_name' | 'email' | 'phone'>;

export type UpdatePasswordData = {
    oldPassword: string,
    newPassword: string,
};

export type UpdatePasswordResponse = 'OK' | {
    reason: string;
};

export class UserinfoAPI extends BaseAPI {
    public async request(): Promise<UserinfoResponse> {
        const url = `${this.baseURL}/auth/user`;
        const response = await this.http.get(url);
        const responseObj: UserinfoResponse = JSON.parse(response.responseText);
        if (!responseObj.reason) {
            return new User(responseObj);
        }
        return responseObj;
    }

    public async update(data: UpdateUserData): Promise<UserinfoResponse> {
        const url = `${this.baseURL}/user/profile`;
        const response = await this.http.put(url, {
            data,
        });
        const updateResponse: UserinfoResponse = JSON.parse(response.responseText);
        if (!updateResponse.reason) {
            return new User(updateResponse);
        }
        return updateResponse;
    }

    public async updatePassword(data: UpdatePasswordData): Promise<UpdatePasswordResponse> {
        const url = `${this.baseURL}/user/password`;
        const response = await this.http.put(url, {
            data,
        });
        let updatePasswordResponse: UpdatePasswordResponse;
        try {
            updatePasswordResponse = JSON.parse(response.responseText);
        } catch {
            updatePasswordResponse = response.responseText as UpdatePasswordResponse;
        }
        return updatePasswordResponse;
    }

    public async updateAvatar(data: FormData): Promise<UserinfoResponse> {
        const url = `${this.baseURL}/user/profile/avatar`;
        const response = await this.http.put(url, {
            credentials: true,
            headers: {
                'content-type': 'no-set',
            },
            data,
        });
        let responseObj: UserinfoResponse;
        try {
            responseObj = JSON.parse(response.responseText);
            return new User(responseObj);
        } catch {
            return {
                reason: response.responseText as string,
            } as UserinfoResponse;
        }
        return responseObj;
    }

    public async isLoggedIn() {
        const info = await this.request();
        if (info.reason) {
            return false;
        }
        return info;
    }
}

export default { UserinfoAPI };
