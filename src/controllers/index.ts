import Messenger from './messenger';
import { RTR } from '../modules/router';
import Settings from './settings';
import SignUp from './sign-up';
import SignIn from './sign-in';
import E404 from './e404';

// if (!document.getElementById('chats-list')) {
//     const container = document.getElementById('container');
//     if (container) {
//         container.innerHTML = '';
//     }
//     TE.render('general/main', document.getElementById('container')).then(() => {
//     });
// }

// const messenger = new Messenger('messenger');
// messenger.start();

RTR.addRoute('sign-in', new SignIn());
RTR.addRoute('sign-up', new SignUp());
RTR.addRoute('messenger', new Messenger(), ['user_id']);
RTR.addRoute('settings', new Settings());
RTR.addRoute('404', new E404());
RTR.default = 'messenger';
RTR.e404 = '404';
RTR.start();
// RTR.start();

// function dumbRouter() {
//     const hash = window.location.hash.substring(1);
//     const id = hash.match(/^chat(\d{1,})$/im);
//     switch (hash) {
//         case '':
//             // login();
//             break;
//         case 'signin':
//             login('signin');
//             break;
//         case 'signup':
//             login('signup');
//             break;
//         case 'chat':
//         case 'nochat':
//             chats();
//             break;
//         case id?.input:
//             chats(id ? parseInt(id[1], 10) : id);
//             break;
//         case 'profile':
//             profile();
//             break;
//         case '404':
//             error(404);
//             break;
//         case '500':
//             error(500);
//             break;
//         default:
//             close();
//             error(404);
//             break;
//     }
// }

export default async function start() {
    // const container = document.getElementById('container');
    // if (container) {
    //     container.innerHTML = '';
    // }
    // dumbRouter();
    // window.addEventListener('hashchange', dumbRouter);
}
