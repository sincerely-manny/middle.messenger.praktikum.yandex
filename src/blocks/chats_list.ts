import Block from '../components/block';
import { Chat, IChat } from './chat';
import { AppEvent, ETB } from '../modules/eventbus';
import { RTR } from '../modules/router';
import { TE } from '../modules/templatebike';

export default class ChatsList extends Block {
    public activeChat?: Chat;

    public chats: Chat[] = [];

    private static instance:ChatsList;

    constructor(data: Chat[]) {
        if (ChatsList.instance) {
            return ChatsList.instance;
        }
        super(data);
        ETB.subcribe(AppEvent.CHAT_LI_IS_Clicked, (c: Chat) => { RTR.go(`messenger/${c.id}`); });
        ETB.subcribe(AppEvent.CHATS_LIST_IS_Rendered_async, this.markActive);
        ETB.subcribe(AppEvent.CHAT_IS_Placed, this.markActive);
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
            .then(() => {
                ETB.trigger(AppEvent.CHATS_LIST_HEADER_IS_Rendered);
            });
        this._props.forEach(async (c: IChat, i: number, a: IChat[]) => {
            const chat = new Chat(c);
            this.chats?.push(chat);
            const html = await chat.renderChatListItem();
            TE.appendTo(document.getElementById('chats'), [html]);
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
            document.getElementById(`chats-list-element-${c.id}`)?.classList.add('active');
        }
        return true;
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

    public getChat(id: number): Chat {
        const chat = this.chats?.find((e) => ((e.id === id) ? e : false));
        if (!chat) {
            throw new Error(`Chat #${id} not found`);
        }
        return chat;
    }
}
