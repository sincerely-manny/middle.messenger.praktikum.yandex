import { appData } from '../modules/appdata';
import { BaseAPI } from './base';
import { UserinfoAPI } from './userinfo';

export type SigninData = {
    login: string,
    password: string,
};

export type SigninResponse = 'OK' | {
    reason: string,
};

export class SigninAPI extends BaseAPI {
    public async request(data: SigninData): Promise<SigninResponse> {
        const url = `${this.baseURL}/auth/signin`;
        const response = await this.http.post(url, { data });
        let signinResponse: SigninResponse;
        try {
            signinResponse = JSON.parse(response.responseText);
        } catch {
            signinResponse = response.responseText as SigninResponse;
        }

        if (signinResponse === 'OK') {
            const userinfoAPI = new UserinfoAPI();
            const userinfoResponse = await userinfoAPI.request();
            if (userinfoResponse.reason) {
                return {
                    reason: `Logged in, but: ${userinfoResponse.reason} (trying to get user info)`,
                };
            }
            appData.user = userinfoResponse;
        }
        return signinResponse;
    }
}

export default { SigninAPI };
