import { BaseAPI } from './base';

type AddToChatData = {
    users: number[],
    chatId: number,
};

type AddToChatResponse = 'OK' | {
    reason: string,
};

type RemoveUserData = {
    users: number[],
    chatId: number,
};

type RemoveUserResponse = 'OK' | {
    reason: string,
};

export class ChatUsersAPI extends BaseAPI {
    public async update(data: AddToChatData): Promise<AddToChatResponse> {
        const url = `${this.baseURL}/chats/users`;
        const response = await this.http.put(url, { data });

        let addToChatResponse: AddToChatResponse;
        try {
            addToChatResponse = JSON.parse(response.responseText);
        } catch {
            addToChatResponse = response.responseText as AddToChatResponse;
        }
        return addToChatResponse;
    }

    public async delete(data: RemoveUserData): Promise<RemoveUserResponse> {
        const url = `${this.baseURL}/chats/users`;
        const response = await this.http.delete(url, { data });
        let removeUserResponse: RemoveUserResponse;
        try {
            removeUserResponse = JSON.parse(response.responseText);
        } catch {
            removeUserResponse = response.responseText as RemoveUserResponse;
        }
        return removeUserResponse;
    }
}

export default { ChatUsersAPI };
