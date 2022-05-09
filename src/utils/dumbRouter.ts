import { renderModalForm } from './renderModalForm';
import { renderMessages } from './renderMessages';
import TemplateBike from '../modules/templatebike';

export function dumbRouter(TE: TemplateBike) {
    const hash = window.location.hash.substring(1);
    let container = document.getElementById('container');
    if (container === null) {
        container = document.createElement('main');
        container.id = 'container';
        document.body.append(container);
    }
    container.innerHTML = '<div id="chats_list"></div><div id="active_chat"></div>';
    const modalWindows = document.getElementsByClassName('modal_window');
    Array.from(modalWindows).forEach((mw) => {
        mw.remove();
    });

    switch (hash) {
        default:
        case 'signin':
            TE.setData('form_data', {
                header: 'Sign in',
                message: 'Don’t have an account?',
                link: {
                    text: 'Sign up',
                    href: '#signup',
                },
                fields: [
                    {
                        type: 'text', value: '', placeholder: 'Login', name: 'login', class: '',
                    },
                    {
                        type: 'password', value: '', placeholder: 'Password', name: 'password', class: '',
                    },
                ],
            });
            renderModalForm(TE);
            break;
        case 'signup':
            TE.setData('form_data', {
                header: 'Sign up',
                message: 'Already have an account?',
                link: {
                    text: 'Sign in',
                    href: '#signin',
                },
                fields: [
                    {
                        type: 'text', value: '', placeholder: 'E-mail', name: 'email', class: '',
                    },
                    {
                        type: 'text', value: '', placeholder: 'Login', name: 'login', class: '',
                    },
                    {
                        type: 'text', value: '', placeholder: 'First name', name: 'first_name', class: '',
                    },
                    {
                        type: 'text', value: '', placeholder: 'Second name', name: 'second_name', class: '',
                    },
                    {
                        type: 'text', value: '', placeholder: 'Phone number', name: 'phone', class: '',
                    },
                    {
                        type: 'password', value: '', placeholder: 'Password', name: 'password', class: '',
                    },
                    {
                        type: 'password', value: '', placeholder: 'Password (one more time)', name: 'password_repeat', class: '',
                    },
                ],
            });
            renderModalForm(TE);
            break;
        case 'nochat':
            TE.render('chats_list/chats_list', document.getElementById('chats_list'));
            TE.render('chat/no_active_chat', document.getElementById('active_chat'));
            break;
        case 'chat':
            TE.render('chats_list/chats_list', document.getElementById('chats_list'));
            TE.render('chat/active_chat', document.getElementById('active_chat')).then(() => {
                renderMessages(TE.data);
                TE.render('chat/new_message_form', document.getElementById('active_chat_new_message'));
            });
            break;
        case 'profile':
            TE.render('chats_list/chats_list', document.getElementById('chats_list'));
            TE.render('profile/profile', document.getElementById('active_chat'));
            break;
        case '404':
            TE.setData('error', {
                num: 404,
                text: 'Page could not be found',
                comment: 'Do you really need it anyway?',
            });
            container.innerHTML = ' ';
            TE.render('errors/error', document.getElementById('container'));
            break;
        case '500':
            TE.setData('error', {
                num: 500,
                text: 'That’s an error',
                comment: 'But we don’t blame it on you',
            });
            container.innerHTML = ' ';
            TE.render('errors/error', document.getElementById('container'));
            break;
    }
    return false;
}

export default dumbRouter;
