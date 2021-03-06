import Block from '../components/block';
import { Chat, IChat } from './chat';
import { AppEvent, ETB } from '../modules/eventbus';
import { RTR } from '../modules/router';
import { TE } from '../modules/templatebike';
import { ChatsListHeader } from './chats_list_header';
import { ChatsAPI } from '../api/chats';
import { InappNotification, InappNotificationStatus } from '../components/notification';
import { appData } from '../modules/appdata';
import ChatsArray from '../modules/chatsArray';
import { ChatUsersAPI } from '../api/chat_users';

export default class ChatsList extends Block {
    public activeChat?: Chat;

    public chats: ChatsArray<Chat> = new ChatsArray();

    private static instance:ChatsList;

    constructor(data: Chat[]) {
        if (ChatsList.instance) {
            return ChatsList.instance;
        }
        super(data);

        this.bindCreateChat = this.bindCreateChat.bind(this);
        this.update = this.update.bind(this);
        this.deleteChat = this.deleteChat.bind(this);

        ETB.subcribe(AppEvent.CHAT_LI_IS_Clicked, (c: Chat) => { RTR.go(`messenger/${c.id}`); });
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

        ETB.subcribe(AppEvent.CHATS_LIST_IS_Updated, this.update);
        ETB.subcribe(AppEvent.CHAT_ToBeDeleted, this.deleteChat);

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
        const header = new ChatsListHeader(this.bindCreateChat);
        header.place(this.childById('chats-list-header', container));
        this._props.forEach(async (c: IChat, i: number, a: IChat[]) => {
            const chat = new Chat(c);
            this.chats?.push(chat);
            if (i === (a.length - 1)) {
                ETB.trigger(AppEvent.CHATS_LIST_IS_Rendered_async, this.activeChat);
            }
        });
        ETB.trigger(AppEvent.CHATS_LIST_IS_Rendered);
        return block;
    }

    private async update(
        optoins: {
            fn: 'pop' | 'push' | 'shift' | 'unshift' | 'splice',
            chats?: Chat[],
        },
    ) {
        const { fn, chats } = optoins;
        if (fn === 'pop' || fn === 'shift' || fn === 'splice') {
            chats?.forEach(async (chat) => {
                chat.unload();
                chat.disconnect();
                chat.listHtmlElement?.remove();
            });
        } else if (fn === 'push') {
            chats?.forEach(async (chat) => {
                chat.renderChatListItem().then((html) => {
                    document.getElementById('chats')?.append(html as Node);
                });
            });
        } else if (fn === 'unshift') {
            chats?.forEach(async (chat) => {
                chat.renderChatListItem().then((html) => {
                    document.getElementById('chats')?.prepend(html as Node);
                });
            });
        }
    }

    public closeActiveChat() {
        if (this.activeChat) {
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
    }

    public getChat(id: number): Chat {
        // ???????????? ?????????????????? .find ??? ?????? ?????? ??????????
        // const chat = this.chats?.find((e) => ((e.id === id) ? e : false));
        let chat: Chat | undefined;
        for (const c of this.chats) {
            if (c.id === id) {
                chat = c;
                break;
            }
        }
        if (!chat) {
            throw new Error(`Chat #${id} not found`);
        }
        return chat;
    }

    private bindCreateChat(e: PointerEvent) {
        const { id } = (e.currentTarget as HTMLElement).dataset;
        if (id) {
            ETB.trigger(AppEvent.USERS_SEARCH_ToBeClosed);
            this.createChat([parseInt(id, 10)]);
            (this._element.querySelector('form.serach-users') as HTMLFormElement).reset();
            (this._element.querySelector('form.serach-users') as HTMLFormElement).blur();
        }
    }

    public async createChat(users: Array<number>) {
        const api = new ChatsAPI();
        const NTF = new InappNotification();
        const { user } = appData;
        const { id } = await api.create({ title: user.display_name_shown });
        if (Number.isInteger(id)) {
            const chatUsersAPI = new ChatUsersAPI();
            const added = await chatUsersAPI.update({
                users,
                chatId: id,
            });
            if (added === 'OK') {
                NTF.notify('Chat created', InappNotificationStatus.INFO);
            }
            if (appData.user.avatar) {
                api.updateAvatar({ url: appData.user.avatar }, id).then((chatdata) => {
                    const chat = new Chat(chatdata);
                    this.chats.unshift(chat);
                    RTR.go(`messenger/${id}`);
                });
            }
        } else {
            NTF.notify('Error creating chat', InappNotificationStatus.ERROR);
        }
    }

    public async deleteChat(chat: Chat) {
        const index = this.chats.indexOf(chat);
        const { title } = chat;
        const api = new ChatsAPI();
        const NTF = new InappNotification();
        api.delete({ chatId: chat.id }).then(() => {
            NTF.notify(`Chat "${title}" deleted`, InappNotificationStatus.INFO);
            this.chats.splice(index, 1);
            RTR.go('messenger');
        });
    }
}
