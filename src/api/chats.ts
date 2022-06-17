import { IChat } from '../blocks/chat';
import { BaseAPI } from './base';

type CreateChatData = {
    title: string,
};

type CreateChatResponse = {
    id: number,
};

type UpdateAvatarData = FormData | {
    url: string
};

type UpdateAvatarResponse = IChat & {
    reason?: string,
};

type DeleteChatData = {
    chatId: number;
};

type DeleteChatResponse = {
    userId: number,
    result: {
        id: number,
        title: string,
        avatar: string,
    }
};
export class ChatsAPI extends BaseAPI {
    public async request(): Promise<IChat[]> {
        const url = `${this.baseURL}/chats`;
        const response = await this.http.get(url);
        const chatslistResponse: IChat[] = JSON.parse(response.responseText);
        return chatslistResponse;
    }

    public async create(data: CreateChatData): Promise<CreateChatResponse> {
        const url = `${this.baseURL}/chats`;
        const response = await this.http.post(url, {
            data,
        });
        const createChatResponse = JSON.parse(response.responseText);
        return createChatResponse;
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
                headers: {
                    'content-type': 'no-set',
                },
                responseType: 'blob',
            });
            imgData.append('avatar', img.response);
        }
        imgData.append('chatId', chatId.toString(10));

        const url = `${this.baseURL}/chats/avatar`;
        const response = await this.http.put(url, {
            credentials: true,
            headers: {
                'content-type': 'no-set',
            },
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

    public async delete(data: DeleteChatData): Promise<DeleteChatResponse> {
        const url = `${this.baseURL}/chats`;
        const response = await this.http.delete(url, {
            data,
        });
        const deleteChatResponse = JSON.parse(response.responseText);
        return deleteChatResponse;
    }
}

export default { ChatsAPI };
