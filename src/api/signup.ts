import { appData } from '../modules/appdata';
import { BaseAPI } from './base';
import { UserinfoAPI } from './userinfo';

export type SignupUserData = {
    first_name: 'string',
    second_name: 'string',
    login: 'string',
    email: 'string',
    password: 'string',
    phone: 'string',
};

export type SignupResponse = {
    id?: number,
    reason: string,
};

export class SignupAPI extends BaseAPI {
    public async create(data: SignupUserData): Promise<SignupResponse> {
        const url = `${this.baseURL}/auth/signup`;
        const response = await this.http.post(url, {
            data,
        });
        const singupResponse: SignupResponse = JSON.parse(response.responseText);
        if (singupResponse.id) {
            const userinfoAPI = new UserinfoAPI();
            const userinfoResponse = await userinfoAPI.request();
            if (userinfoResponse.reason) {
                return {
                    reason: `Logged in, but: ${userinfoResponse.reason} (trying to get user info)`,
                };
            }
            appData.user = userinfoResponse;
            return singupResponse;
        }
        return singupResponse;
    }
}

export default { SignupAPI };
