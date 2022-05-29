import Block from '../components/block';
import { Chat } from './chat';
import { Message } from '../components/message';
import { appData } from '../modules/applicationdata';
import { AppEvent, ETB } from '../modules/eventbus';
import { RTR } from '../modules/router';
import { TE } from '../modules/templatebike';

export default class ChatsList extends Block {
    public activeChat?: Chat;

    public chats!: Chat[];

    private static instance:ChatsList;

    constructor() {
        if (ChatsList.instance) {
            return ChatsList.instance;
        }
        super(appData);
        this.chats = appData.chats.map(
            (e) => new Chat(
                {
                    user_id: e.user_id,
                    messages: e.messages as Message[],
                    me: appData.user,
                },
            ),
        );

        ETB.subcribe(AppEvent.CHAT_LI_IS_Clicked, (c: Chat) => { RTR.go(`messenger/${c.user_id}`); });
        ETB.subcribe(AppEvent.CHAT_IS_Rendered, this.scrollChat);
        ETB.subcribe(AppEvent.CHATS_LIST_IS_Rendered_async, this.markActive);
        ETB.subcribe(AppEvent.CHAT_IS_Placed, this.markActive);
        ETB.subcribe(AppEvent.CHAT_IS_Placed, this.scrollChat);
        ETB.subcribe(AppEvent.KEY_PRESSED_Escape, () => {
            if (this.activeChat) {
                RTR.go('messenger');
            }
        });
        document.body.addEventListener('keyup', (e) => {
            if (e.key === 'Escape') {
                ETB.trigger(AppEvent.KEY_PRESSED_Escape);
            }
        });
        ChatsList.instance = this;
    }

    protected render() {
        const container = document.createElement('div');
        container.id = 'chats-list_container';
        this.renderAsync(container);
        return container;
    }

    private async renderAsync(container: HTMLElement) {
        if (this._element) {
            return [this._element];
        }
        const block = await TE.render('chats_list/chats_list', container);
        TE.render('chats_list/header', this.childById('chats-list-header', container))
            .then(() => { ETB.trigger(AppEvent.CHATS_LIST_HEADER_IS_Rendered); });
        this.chats.forEach(async (c, i, a) => {
            const chatCollection = await TE.render('chats_list/chat', null, c);
            // eslint-disable-next-line no-param-reassign
            [c.listHtmlElement] = chatCollection;
            c.listHtmlElement.addEventListener('click', (e) => {
                if (!(e.target as HTMLElement).classList.contains('active')) {
                    ETB.trigger(AppEvent.CHAT_LI_IS_Clicked, c);
                }
            });
            TE.appendTo(document.getElementById('chats'), chatCollection);
            if (i === (a.length - 1)) {
                ETB.trigger(AppEvent.CHATS_LIST_IS_Rendered_async, this.activeChat);
            }
        });
        ETB.trigger(AppEvent.CHATS_LIST_IS_Rendered);
        return block;
    }

    private markActive(c: Chat) {
        document.querySelectorAll('#chats>.chat.active').forEach((e) => {
            e.classList.remove('active');
        });
        if (!c) {
            return false;
        }
        if (c.listHtmlElement) {
            c.listHtmlElement.classList.add('active');
        } else {
            document.getElementById(`chats-list-element-${c.user_id}`)?.classList.add('active');
        }
        return true;
    }

    private scrollChat() {
        const container = document.getElementById('active-chat');
        const chatCont = document.getElementById('active-chat-messages_container');
        if (chatCont) {
            // setTimeout(() => {
            if (container) {
                container.style.transition = 'opacity 0.3s, filter 0.5s';
                container.style.opacity = '1';
                container.style.filter = 'blur(0)';
            }
            chatCont.scrollTo({ top: chatCont.scrollHeight });
            // }, 300);
        }
    }

    public closeActiveChat() {
        this.markActive({} as Chat);
        if (this.activeChat) {
            // чтобы не рендерить заново при повторном открытии выгрузим html
            this.activeChat.unload();
            this.activeChat = undefined;
        }
        const container = document.getElementById('active-chat');
        if (container) {
            container.innerHTML = '';
        }
        ETB.trigger(AppEvent.NOCHAT_IS_Placed);
    }

    public async openChat(c: Chat | number) {
        this.closeActiveChat();
        if (c instanceof Chat) {
            this.activeChat = c;
        } else {
            this.activeChat = this.getChat(c);
        }
        this.activeChat.place(
            this.childById(
                'active-chat-container',
                this.childById(
                    'active-chat',
                    this.childById('container'),
                ),
            ),
        );
        this.markActive(this.activeChat);
    }

    public getChat(user_id: number): Chat {
        const chat = this.chats?.find((e) => ((e.user_id === user_id) ? e : false));
        if (!chat) {
            throw new Error(`Chat #${user_id} not found`);
        }
        return chat;
    }
}
