import { appData } from '../modules/applicationdata';
import { Chat } from '../components/chat';
import { ETB, Event } from '../modules/eventbus';
import TemplateBike from '../modules/templatebike';

const TE = TemplateBike.getInstance();

let activeChat: Chat | undefined;

function markActive(c: Chat) {
    document.querySelectorAll('#chats>.chat.active').forEach((e) => {
        e.classList.remove('active');
    });
    if (c.listHtmlElement) {
        c.listHtmlElement.classList.add('active');
    }
}

function closeActiveChat() {
    if (activeChat) {
        markActive({} as Chat);
        // чтобы не рендерить заново при повторном открытии выгрузим html
        activeChat.unload();
        activeChat = undefined;
    }
    const container = document.getElementById('active-chat');
    if (container) {
        container.innerHTML = '';
    }
    ETB.trigger(Event.NOCHAT_IS_Placed);
}

async function openChat(c: Chat) {
    closeActiveChat();
    const chatContent = await c.render();
    ETB.trigger(Event.CHAT_IS_Rendered, c);
    const container = document.getElementById('active-chat');
    if (container) {
        container.innerHTML = '';
    }
    TE.appendTo(document.getElementById('active-chat'), chatContent);
    activeChat = c;
    ETB.trigger(Event.CHAT_IS_Placed, c);
}

function preload() {
    const container = document.getElementById('active-chat');
    if (container) {
        container.style.transition = 'opacity 0s';
        container.style.opacity = '0';
        container.style.filter = 'blur(10px)';
    }
}

function scrollChat() {
    const container = document.getElementById('active-chat');
    const chatCont = document.getElementById('active-chat-messages_container');
    if (chatCont) {
        setTimeout(() => {
            if (container) {
                container.style.transition = 'opacity 0.3s, filter 0.5s';
                container.style.opacity = '1';
                container.style.filter = 'blur(0)';
            }
            chatCont.scrollTo({ top: chatCont.scrollHeight });
        }, 300);
    }
}

export async function chats(id: number | null = null): Promise<void> {
    if (!document.getElementById('chats-list')) {
        const container = document.getElementById('container');
        if (container) {
            container.innerHTML = '';
        }
        await TE.render('general/main', document.getElementById('container'));
    }
    if (!document.getElementById('chats-list-header')) {
        await TE.render('chats_list/chats_list', document.getElementById('chats-list'));
        TE.render('chats_list/header', document.getElementById('chats-list-header'));
        appData.chats?.forEach(async (c) => {
            const chatCollection = await TE.render('chats_list/chat', null, c);
            // eslint-disable-next-line no-param-reassign
            [c.listHtmlElement] = chatCollection;
            c.listHtmlElement.addEventListener('click', (e) => {
                if (!(e.target as HTMLElement).classList.contains('active')) {
                    ETB.trigger(Event.CHAT_LI_IS_Clicked, c);
                }
            });
            TE.appendTo(document.getElementById('chats'), chatCollection);
        });
    }
    if (!Number.isInteger(id)) {
        closeActiveChat();
    } else if (activeChat?.user_id !== id) {
        preload();
        openChat(appData.getChat(id as number));
    }
}

ETB.subcribe(Event.CHAT_LI_IS_Clicked, (c: Chat) => { window.location.hash = `chat${c.user_id}`; });
ETB.subcribe(Event.CHAT_IS_Rendered, markActive);
ETB.subcribe(Event.CHAT_IS_Placed, scrollChat);
ETB.subcribe(Event.KEY_PRESSED_Escape, () => {
    if (activeChat) {
        window.location.hash = 'chat';
    }
});

document.body.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') {
        ETB.trigger(Event.KEY_PRESSED_Escape);
    }
});

export default { chats };
