import HTTPTransport from '../modules/httptransport';

const baseURL = 'https://ya-praktikum.tech/api/v2';

export class BaseAPI {
    protected baseURL: string;

    protected http: HTTPTransport;

    constructor() {
        this.baseURL = baseURL;
        this.http = new HTTPTransport();
    }

    create(_data: any): Promise<any> { throw new Error('Not implemented'); }

    request(_data: any): Promise<any> { throw new Error('Not implemented'); }

    update(_data: any): Promise<any> { throw new Error('Not implemented'); }

    delete(_data: any): Promise<any> { throw new Error('Not implemented'); }
}

export default BaseAPI;
