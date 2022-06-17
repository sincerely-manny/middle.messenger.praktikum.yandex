import { InappNotification, InappNotificationStatus } from '../components/notification';
import { User } from '../modules/user';
import { BaseAPI } from './base';

type ConnectResponse = {
    token: string,
};

export class MessagesAPI extends BaseAPI {
    public socket?: WebSocket;

    public ping?: ReturnType<typeof setInterval>;

    private connection: Promise<void>;

    private connectionResolve: Function = () => {};

    private connectionReject: Function = () => {};

    private messageRecievedCallback: Function;

    constructor(callback: Function) {
        super();
        this.connection = new Promise((resolve, reject) => {
            this.connectionResolve = resolve;
            this.connectionReject = reject;
        });
        this.messageRecievedCallback = callback;
    }

    public async connect(id: number, user: User): Promise<ConnectResponse> {
        const url = `${this.baseURL}/chats/token/${id}`;
        const response = await this.http.post(url, {
            credentials: true,
            headers: {
                'content-type': 'application/json',
            },
        });
        const connectResponse: ConnectResponse = JSON.parse(response.responseText);
        this.getSocket(user.id, id, connectResponse.token);
        return connectResponse;
    }

    public disconnect() {
        if (this.ping) {
            clearInterval(this.ping);
        }
        this.socket?.close(1000, 'Disconnected by the app');
    }

    public getSocket(userId: number, chatId: number, token: string) {
        const socket = new WebSocket(`${this.socketURL}/${userId}/${chatId}/${token}`);
        const NTF = new InappNotification();
        this.socket = socket;
        this.ping = setInterval(() => {
            socket.send(JSON.stringify({
                type: 'ping',
            }));
        }, 5000);

        socket.addEventListener('open', () => {
            this.connectionResolve();
        });

        socket.addEventListener('close', (event) => {
            if (event.wasClean) {
                NTF.notify('Connection closed', InappNotificationStatus.NOTICE);
            } else {
                NTF.notify(`Connection broken: ${event.reason}`, InappNotificationStatus.ERROR);
            }
            // console.log(`Код: ${event.code} | Причина: ${event.reason}`);
        });

        socket.addEventListener('message', (event) => {
            this.messageRecievedCallback(JSON.parse(event.data));
        });

        socket.addEventListener('error', (event) => {
            this.connectionReject();
            NTF.notify(`Connection error: ${(event as ErrorEvent).message}`, InappNotificationStatus.ERROR);
            // console.log('Ошибка', (event as ErrorEvent).message);
        });
        return this.socket;
    }

    public sendMessage(text: string) {
        this.connection.then(() => {
            if (!this.socket) {
                throw new Error('Not connected to the socket');
            }
            this.socket.send(JSON.stringify({
                content: text,
                type: 'message',
            }));
        });
    }

    public requestMessages(offset: number) {
        this.connection.then(() => {
            if (!this.socket) {
                throw new Error('Not connected to the socket');
            }
            this.socket.send(JSON.stringify({
                content: offset,
                type: 'get old',
            }));
        });
    }
}

export default { MessagesAPI };
