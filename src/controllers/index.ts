import { chats } from './chats';
import { login, close } from './login';
import { error } from './error';
import { profile } from './profile';

function dumbRouter() {
    const hash = window.location.hash.substring(1);
    const id = hash.match(/^chat(\d{1,})$/im);
    switch (hash) {
        case '':
            login();
            break;
        case 'signin':
            login('signin');
            break;
        case 'signup':
            login('signup');
            break;
        case 'chat':
        case 'nochat':
            chats();
            break;
        case id?.input:
            chats(id ? parseInt(id[1], 10) : id);
            break;
        case 'profile':
            profile();
            break;
        case '404':
            error(404);
            break;
        case '500':
            error(500);
            break;
        default:
            close();
            error(404);
            break;
    }
}

export default async function start() {
    const container = document.getElementById('container');
    if (container) {
        container.innerHTML = '';
    }
    dumbRouter();
    window.addEventListener('hashchange', dumbRouter);
}
