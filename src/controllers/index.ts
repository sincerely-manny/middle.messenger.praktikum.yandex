import Messenger from './messenger';
import { RTR } from '../modules/router';
import Settings from './settings';
import SignUp from './sign-up';
import SignIn from './sign-in';
import E404 from './e404';
import { UserinfoAPI } from '../api/userinfo';
import { appData } from '../modules/appdata';

export default async function start() {
    RTR.addRoute('sign-in', new SignIn());
    RTR.addRoute('sign-up', new SignUp());
    RTR.addRoute('messenger', new Messenger(), ['user_id']);
    RTR.addRoute('settings', new Settings());
    RTR.addRoute('404', new E404());
    RTR.default = 'messenger';
    RTR.e404 = '404';

    const userinfoAPI = new UserinfoAPI();
    const userinfo = await userinfoAPI.isLoggedIn();
    if (userinfo) {
        appData.user = userinfo;
        RTR.start();
    } else if (RTR.root === 'sign-in' || RTR.root === 'sign-up') {
        RTR.start();
    } else {
        RTR.go('sign-in');
    }
}
