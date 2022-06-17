import { expect } from 'chai';
import jsdom from 'jsdom-global';
import SignUp from '../controllers/sign-up';
import SignIn from '../controllers/sign-in';
import { RTR } from './router';

describe('Проверяем Роутер', () => {
    before(() => {
        jsdom('', { url: 'https://example.com/' });
        RTR.addRoute('sign-in', new SignIn());
        RTR.addRoute('sign-up', new SignUp());
        RTR.addRoute('404', new SignIn());
        RTR.default = 'sign-in';
        RTR.e404 = '404';
    });
    it('При загрузке должен срабатывать default route', () => {
        RTR.start();
        expect(RTR.root).to.eq('sign-in');
    });
    it('Default route срабатывает без перехода', () => {
        expect(window.location.pathname).to.eq('/');
    });
    it('Переход на другой route изменяет url', () => {
        RTR.go('sign-up');
        expect(window.location.pathname).to.eq('/sign-up');
    });
});
