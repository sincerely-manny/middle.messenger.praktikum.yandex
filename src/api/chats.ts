import { IChat } from '../blocks/chat';
import { BaseAPI } from './base';

type CreateChatData = {
    title: string,
};

type CreateChatResponse = {
    id: number,
};

type AddToChatData = {
    users: number[],
    chatId: number,
};

type AddToChatResponse = 'OK' | {
    reason: string,
};

type UpdateAvatarData = FormData | {
    url: string
};

type UpdateAvatarResponse = IChat & {
    reason?: string,
};

export class ChatsAPI extends BaseAPI {
    public async request(): Promise<IChat[]> {
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

    public async create(data: CreateChatData): Promise<CreateChatResponse> {
        const url = `${this.baseURL}/chats`;
        const response = await this.http.post(url, {
            credentials: true,
            headers: {
                'content-type': 'application/json',
            },
            data,
        });
        const createChatResponse = JSON.parse(response.responseText);
        return createChatResponse;
    }

    public async update(data: AddToChatData): Promise<AddToChatResponse> {
        const url = `${this.baseURL}/chats/users`;
        const response = await this.http.put(url, {
            credentials: true,
            headers: {
                'content-type': 'application/json',
            },
            data,
        });

        let addToChatResponse: AddToChatResponse;
        try {
            addToChatResponse = JSON.parse(response.responseText);
        } catch {
            addToChatResponse = response.responseText as AddToChatResponse;
        }
        return addToChatResponse;
    }

    public async updateAvatar(
        data: UpdateAvatarData,
        chatId: number,
    ): Promise<UpdateAvatarResponse> {
        let imgData: FormData;
        if (data instanceof FormData) {
            imgData = data;
        } else {
            imgData = new FormData();
            const img = await this.http.get(`https://ya-praktikum.tech/api/v2/resources${data.url}`, {
                credentials: true,
                responseType: 'blob',
            });
            imgData.append('avatar', img.response);
        }
        imgData.append('chatId', chatId.toString(10));

        const url = `${this.baseURL}/chats/avatar`;
        const response = await this.http.put(url, {
            credentials: true,
            data: imgData,
        });
        let responseObj: IChat;
        try {
            responseObj = JSON.parse(response.responseText);
            return responseObj;
        } catch {
            return {
                reason: response.responseText as string,
            } as UpdateAvatarResponse;
        }
        return responseObj;
    }
}

export default { ChatsAPI };
