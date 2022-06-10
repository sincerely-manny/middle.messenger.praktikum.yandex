import { IChat } from '../blocks/chat';
import { BaseAPI } from './base';

export class ChatsAPI extends BaseAPI {
    public async request(): Promise<any> {
        const url = `${this.baseURL}/chats`;
        const response = await this.http.get(url, {
            credentials: true,
            headers: {
                'content-type': 'application/json',
            },
        });
        const chatslistResponse: IChat[] = JSON.parse(response.responseText);
        return chatslistResponse;
    }
}

export default { ChatsAPI };
