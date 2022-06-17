import HTTPTransport from '../modules/httptransport';

const baseURL = 'https://ya-praktikum.tech/api/v2';
const socketURL = 'wss://ya-praktikum.tech/ws/chats';

export class BaseAPI {
    protected baseURL: string;

    protected socketURL: string;

    protected http: HTTPTransport;

    constructor() {
        this.baseURL = baseURL;
        this.socketURL = socketURL;
        this.http = new HTTPTransport();
    }

    create(_data: any): Promise<any> { throw new Error('Not implemented'); }

    request(_data: any): Promise<any> { throw new Error('Not implemented'); }

    update(_data: any): Promise<any> { throw new Error('Not implemented'); }

    delete(_data: any): Promise<any> { throw new Error('Not implemented'); }
}

export default BaseAPI;
