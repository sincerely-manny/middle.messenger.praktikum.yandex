import { expect } from 'chai';
import HTTPTransport from './httptransport';

const xhr = new HTTPTransport();

describe('Проверяем HTTPTransport', () => {
    it('GET отправляет и получает данные', async () => {
        const reuqest = xhr.get(
            'https://httpbin.org/anything',
            { data: { param: 'val' } },
        );
        const response = JSON.parse((await reuqest).responseText);
        expect(response.args.param).to.be.eq('val');
    });
    it('POST отправляет и получает данные', async () => {
        const reuqest = xhr.post(
            'https://httpbin.org/anything',
            { data: { param: 'val' } },
        );
        const response = JSON.parse((await reuqest).responseText);
        expect(response.json.param).to.be.eq('val');
    });
    it('PUT отправляет и получает данные', async () => {
        const reuqest = xhr.put(
            'https://httpbin.org/anything',
            { data: { param: 'val' } },
        );
        const response = JSON.parse((await reuqest).responseText);
        expect(response.json.param).to.be.eq('val');
    });
    it('DELETE отправляет и получает данные', async () => {
        const reuqest = xhr.delete(
            'https://httpbin.org/anything',
            { data: { param: 'val' } },
        );
        const response = JSON.parse((await reuqest).responseText);
        expect(response.json.param).to.be.eq('val');
    });
});
