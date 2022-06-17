import { BaseAPI } from './base';

export type LogoutResponse = 'OK' | {
    reason: string;
};

export class LoguotAPI extends BaseAPI {
    public async request(): Promise<LogoutResponse> {
        const url = `${this.baseURL}/auth/logout`;
        const response = await this.http.post(url);
        let logoutResponse: LogoutResponse;
        try {
            logoutResponse = JSON.parse(response.responseText);
        } catch {
            logoutResponse = response.responseText as LogoutResponse;
        }
        return logoutResponse;
    }
}

export default { LoguotAPI };
