import Messenger from './messenger';
import { RTR } from '../modules/router';
import Settings from './settings';
import SignUp from './sign-up';
import SignIn from './sign-in';
import E404 from './e404';

RTR.addRoute('sign-in', new SignIn());
RTR.addRoute('sign-up', new SignUp());
RTR.addRoute('messenger', new Messenger(), ['user_id']);
RTR.addRoute('settings', new Settings());
RTR.addRoute('404', new E404());
RTR.default = 'messenger';
RTR.e404 = '404';

export default function start() {
    RTR.start();
}
