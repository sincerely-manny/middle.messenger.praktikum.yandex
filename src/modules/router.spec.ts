import { expect } from 'chai';
import jsdom from 'jsdom-global';
import SignIn from '../controllers/sign-in';
import { RTR } from './router';

describe('Проверяем переходы Роутера', () => {
    before(() => {
        jsdom('', { url: 'https://example.com/' });
    });
    it('Переход на новую страницу должен менять состояние сущности history', () => {
        RTR.addRoute('messenger', new SignIn(), ['user_id']);
        RTR.addRoute('404', new SignIn());
        RTR.default = 'messenger';
        RTR.e404 = '404';
        RTR.start();
        RTR.go('messenger');
        expect(RTR.root).to.eq('messenger');
    });
});
