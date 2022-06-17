import { IMessage, Message } from '../components/message';
import { User } from '../modules/user';
import { TE } from '../modules/templatebike';
import Block from '../components/block';
import { AppEvent, ETB } from '../modules/eventbus';
import { MessagesAPI } from '../api/messages';
import { UsersAPI } from '../api/users';
import { appData } from '../modules/appdata';
import { replaceOnError } from '../utils/dummyavatar';
import getBase64Image from '../utils/imgbase64';
import { RTR } from '../modules/router';
import { ChatUsersAPI } from '../api/chat_users';
import { InappNotification, InappNotificationStatus } from '../components/notification';
import SearchUserForm from './search_user_form';

export interface IChat {
    id: number,
    title: string,
    avatar: string,
    unread_count: number,
    last_message: Message,
    messages?: Message[],
}

export class Chat extends Block implements IChat {
    public id!: number;

    public title!: string;

    public avatar!: string;

    public unread_count!: number;

    private _last_message!: Message;

    public messages: Message[] = [];

    private messagesContainer?: HTMLElement;

    public api: MessagesAPI;

    public listHtmlElement?: HTMLElement;

    private users!: Promise<User[]>;

    private scrollHeight?: number;

    private _unixTimestamp: number = 0;

    private _active: boolean = false;

    constructor(data: IChat) {
        super(data);
        Object.assign(this, data);

        this.getChatUsers();
        this.last_message = new Message(this.last_message);
        if (this.last_message?.content && this.last_message.content.length > 90) {
            this.last_message.content = `${[...this.last_message.content].slice(0, 90).join('').trim()}...`;
        }

        this.catchMessages = this.catchMessages.bind(this);
        this.api = new MessagesAPI(this.catchMessages);
        this.connect();

        this.scrollTopListener = this.scrollTopListener.bind(this);
        this.scrollToTheEnd = this.scrollToTheEnd.bind(this);
        this.loadPreviousMessages = this.loadPreviousMessages.bind(this);
        this.initLoadMessages = this.initLoadMessages.bind(this);
        this.bindAddToChat = this.bindAddToChat.bind(this);
    }

    public get last_message(): Message {
        return this._last_message;
    }

    public set last_message(data: Message) {
        let time: string = '';
        const content = this?.last_message?.content;
        if (this.last_message) {
            time = this._last_message.time;
        }
        this._last_message = data;
        if (data?.time) {
            this.unixTimestamp = new Date(data.time).getTime() / 1000 - 1640984400;
        } else {
            this.unixTimestamp = 0 - this.id;
        }
        if (data?.time !== time || data.content !== content) {
            this.renderChatListItem();
        }
    }

    public get unixTimestamp() {
        return this._unixTimestamp;
    }

    public set unixTimestamp(t: number) {
        this._unixTimestamp = t;
        const el = this.listHtmlElement;
        if (el) {
            el.setAttribute('style', `--data-timestamp:${t};`);
        }
    }

    public get active() {
        return this._active;
    }

    public set active(a: boolean) {
        this._active = a;
        if (a) {
            this.listHtmlElement?.classList.add('active');
        } else {
            this.listHtmlElement?.classList.remove('active');
        }
    }

    public async connect() {
        await this.api.connect(this.id, appData.user);
        ETB.trigger(AppEvent.CHAT_TOKEN_Recieved, this);
    }

    public disconnect() {
        this.api.disconnect();
    }

    public render() {
        const container = document.createElement('div');
        container.id = 'active-chat-container';
        this._isRendered = this.renderAsync();
        return container;
    }

    private async renderAsync() {
        if (this._element) {
            return [this._element];
        }
        const activeChat = TE.render('chat/active_chat', this._element);
        await this.renderUsersInChat((await activeChat)[0]);
        this.messagesContainer = (await activeChat)[0].querySelector('#active-chat-messages') as HTMLElement;
        const newMsgContainer = (await activeChat)[0].querySelector('#active-chat-new-message') as HTMLElement;
        TE.render('chat/new_message_form', newMsgContainer).then(() => {
            ETB.trigger(AppEvent.CHAT_NEWMESSAGE_FORM_IS_Rendered, this);
        });
        [this._element] = (await activeChat);
        this._element.querySelector('#active-chat-header .close')?.addEventListener('click', (e) => {
            e.preventDefault();
            RTR.go('messenger');
        });
        this._element.querySelector('#active-chat-header .delete')?.addEventListener('click', (e) => {
            e.preventDefault();
            ETB.trigger(AppEvent.CHAT_ToBeDeleted, this);
        });
        const addButton = this._element.querySelector('#active-chat-header .add');
        addButton?.addEventListener('click', (e) => {
            e.preventDefault();
        });
        if (addButton) {
            const searchUserForm = new SearchUserForm(this.bindAddToChat);
            searchUserForm.place(addButton as HTMLElement);
        }

        return activeChat;
    }

    private async renderUsersInChat(parent: HTMLElement) {
        if (!await this.users) {
            this.getChatUsers();
        }
        const usersInChat: Array<HTMLElement> = [];
        for (const u of (await this.users)) {
            const li = (await TE.render('chat/user_in_chat', null, u))[0];
            li.querySelector('a.remove')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.removeUserFromChat(u, li);
            });
            usersInChat.push(li);
        }
        this.childById('users-in-chat-list', parent).innerHTML = '';
        TE.appendTo(this.childById('users-in-chat-list', parent), usersInChat);
    }

    public unload(): HTMLDivElement {
        ETB.unsubscribe(AppEvent.CHAT_IS_Placed, this.scrollToTheEnd);
        ETB.unsubscribe(AppEvent.CHAT_IS_Rendered, this.scrollTopListener);
        ETB.unsubscribe(AppEvent.CHAT_IS_Rendered, this.initLoadMessages);
        const ret = super.unload();
        this.active = false;
        return ret;
    }

    public async renderChatListItem(): Promise<HTMLElement | undefined> {
        // Да, так надо чтобы не перерисовывать 2 раза при загрузке
        // метод вызовется после парсинга последнего сообщения
        if (!(this.last_message instanceof Message)) {
            return this.listHtmlElement;
        }
        if (this.title === appData.user.display_name_shown || this.title === '...') {
            const namesArr: Array<string> = [];
            const users = await this.users;
            if (Array.isArray(users)) {
                users.forEach((u) => {
                    if (u.id !== appData.user.id) {
                        namesArr.push(u.display_name_shown);
                    }
                });
            }
            if (namesArr.length !== 0) {
                this.title = namesArr.join(', ');
            } else {
                this.title = '...';
            }
        }

        // если у чата нет аватарки или стоит наша – подставим кого-нибудь из собеседников
        if (!this.avatar || await this.compareImage(this.avatar)) {
            const users = await this.users;
            this.avatar = users.find((u) => u.id !== appData.user.id)?.avatar || this.avatar;
        }

        const [html] = await TE.render('chats_list/chat', null, this);
        if (this.listHtmlElement) {
            this.listHtmlElement.className.split(' ').forEach((c) => {
                html.classList.add(c);
            });
            this.listHtmlElement.replaceWith(html);
        }
        this.listHtmlElement = html;
        this.listHtmlElement.addEventListener('click', () => {
            if (!this.active) {
                ETB.trigger(AppEvent.CHAT_LI_IS_Clicked, this);
            }
        });
        replaceOnError(this.listHtmlElement.querySelector('.avatar > img') as HTMLElement, this.title);
        if (this.active) {
            this.listHtmlElement.classList.add('active');
        }
        return this.listHtmlElement;
    }

    private async renderMessages(messages: Message[]) {
        let sender = {} as User;
        let currShownDate: string | undefined;
        let rendered: HTMLElement[] = [];
        let insertFn: Function;
        const appendTo = TE.appendTo.bind(TE);
        const prependTo = TE.prependTo.bind(TE);

        await this.users; // подождем, пока в appData приедут пользователи
        if (this.messages.length !== 0) {
            const firstRenderedMessage = this.messages[0];
            const lastRenderedMessage = this.messages[this.messages.length - 1];
            const firstRecievedMessage = messages[0];
            const lastRecievedMessage = messages[messages.length - 1];
            if (
                new Date(lastRenderedMessage.time) <= new Date(firstRecievedMessage.time)
            ) { // пришли сообщения новее
                insertFn = appendTo;
                sender = appData.users[+lastRenderedMessage.user_id];
                currShownDate = lastRenderedMessage.datePretty;
            } else { // пришли более старые сообщения
                insertFn = prependTo;
                if (firstRenderedMessage.datePretty === lastRecievedMessage.datePretty) {
                    this.messagesContainer?.querySelector('.date-separator')?.remove();
                    if (+firstRenderedMessage.user_id === +lastRecievedMessage.user_id) {
                        this.messagesContainer?.querySelector('.sender')?.remove();
                    }
                }
            }
        } else {
            insertFn = appendTo;
        }

        const newMessages: Message[] = [];
        for (const message of messages) {
            let newDate = false;
            if (currShownDate !== message.datePretty) {
                currShownDate = message.datePretty;
                newDate = true;
                rendered = rendered.concat(await TE.render('messages/date', null, message));
            }
            if (sender.id !== +message.user_id || newDate) {
                sender = appData.users[+message.user_id];
                rendered = rendered.concat(await TE.render('messages/sender', null, sender));
            }
            if (message.file) {
                [message.htmlElement] = await TE.render('messages/message_img', null, message);
            } else {
                [message.htmlElement] = await TE.render('messages/message', null, message);
            }
            rendered.push(message.htmlElement);
            newMessages.push(message);
        }
        if (insertFn === appendTo) {
            this.messages = this.messages.concat(newMessages);
            ETB.trigger(AppEvent.CHAT_NEW_MESSAGES_Appended, this);
        } else {
            this.messages = newMessages.concat(this.messages);
            ETB.trigger(AppEvent.CHAT_NEW_MESSAGES_Prepended, this);
        }
        if (this.messagesContainer) {
            this.setScrollParams();
            insertFn(this.messagesContainer, rendered);
        }
        if (insertFn === prependTo) {
            this.preserveScroll();
        } else {
            this.scrollToTheEnd();
        }
        this.last_message = this.messages[this.messages.length - 1];
        ETB.trigger(AppEvent.CHAT_IS_Rendered, this);
        return this.messagesContainer;
    }

    public async place(parent: HTMLElement) {
        ETB.subcribe(AppEvent.CHAT_IS_Placed, this.scrollToTheEnd);
        ETB.subcribe(AppEvent.CHAT_IS_Rendered, this.scrollTopListener);
        ETB.subcribe(AppEvent.CHAT_IS_Rendered, this.initLoadMessages);
        if (this.messages.length === 0) {
            this.requestMessages(0);
        }
        await super.place(parent);
        ETB.trigger(AppEvent.CHAT_IS_Placed, this);
        this.active = true;
        return this._element;
    }

    public send(text: string) {
        this.api.sendMessage(text);
    }

    private requestMessages(offset: number) {
        this._element.classList.add('loading');
        this.api.requestMessages(offset);
    }

    private catchMessages(data: IMessage | IMessage[]) {
        let recievedMessages: IMessage[];
        if (!Array.isArray(data)) {
            recievedMessages = [data];
        } else {
            recievedMessages = data;
        }
        if (recievedMessages.length !== 0 && recievedMessages[0].type !== 'pong') {
            this._element.classList.remove('loading');
        } else {
            return;
        }
        const messages = recievedMessages
            .filter((m) => m.type === 'message')
            .map((m) => new Message(m))
            .reverse();
        if (messages.length < 20) {
            ETB.unsubscribe(AppEvent.CHAT_IS_Rendered, this.scrollTopListener);
            ETB.unsubscribe(AppEvent.CHAT_IS_Rendered, this.initLoadMessages);
        }
        if (messages.length !== 0) {
            this.renderMessages(messages);
        }
    }

    private async getChatUsers() {
        const api = new UsersAPI();
        this.users = api.getUsersByChat(this.id);
        appData.setUser(await this.users);
    }

    private scrollTopListener() {
        this.messagesContainer?.parentElement?.addEventListener('scroll', this.loadPreviousMessages, { passive: true });
    }

    private loadPreviousMessages() {
        if (this.messagesContainer?.parentElement?.scrollTop === 0) {
            this.requestMessages(this.messages.length);
            this.messagesContainer?.parentElement?.removeEventListener('scroll', this.loadPreviousMessages);
        }
    }

    private initLoadMessages() {
        if (
            this.messagesContainer?.parentElement
            && (
                this.messagesContainer?.parentElement?.scrollHeight
                <= this.messagesContainer?.parentElement?.clientHeight
            )
        ) {
            this.loadPreviousMessages();
        }
    }

    private scrollToTheEnd() {
        ETB.unsubscribe(AppEvent.CHAT_IS_Rendered, this.scrollToTheEnd);
        if (this.messagesContainer?.parentElement) {
            setTimeout(() => {
                this.messagesContainer?.parentElement?.scrollTo(
                    { top: this.messagesContainer.parentElement.scrollHeight },
                );
            }, 100);
        }
    }

    private setScrollParams() {
        if (this.messagesContainer?.parentElement) {
            this.scrollHeight = this.messagesContainer.parentElement.scrollHeight;
        }
    }

    private preserveScroll() {
        if (this.messagesContainer?.parentElement && this.scrollHeight) {
            if (this.messagesContainer.parentElement.scrollHeight > this.scrollHeight) {
                const delta = this.messagesContainer.parentElement.scrollHeight - this.scrollHeight;
                this.messagesContainer.parentElement.scrollTo({
                    top: (this.messagesContainer.parentElement.scrollTop + (delta / 2)),
                });
            }
        }
        this.setScrollParams();
    }

    private async compareImage(url: string) {
        return ((await appData.user.avatarBase64) === (await getBase64Image(url)));
    }

    private removeUserFromChat(u: User, li?: HTMLElement) {
        const api = new ChatUsersAPI();
        const NTF = new InappNotification();
        api.delete({ users: [u.id], chatId: this.id }).then(async (r) => {
            if (r === 'OK') {
                li?.remove();
                NTF.notify(`${u.display_name_shown} removed from chat`, InappNotificationStatus.INFO);
                this.getChatUsers();
                this.renderChatListItem();
            } else {
                NTF.notify(`Error removing user: ${r.reason}`);
            }
        });
    }

    private addUserToChat(id: number) {
        const api = new ChatUsersAPI();
        const NTF = new InappNotification();
        api.update({ users: [id], chatId: this.id }).then(async (r) => {
            if (r === 'OK') {
                this.getChatUsers();
                const newUser = (await this.users).find((u) => u.id === id);
                if (newUser) {
                    NTF.notify(`${newUser?.display_name_shown} added to chat`, InappNotificationStatus.INFO);
                    this.renderChatListItem();
                    this.renderUsersInChat(this._element);
                } else {
                    NTF.notify('Error fetching added user info');
                }
            } else {
                NTF.notify(`Error adding user: ${r.reason}`);
            }
        });
    }

    private bindAddToChat(e: PointerEvent) {
        const { id } = (e.currentTarget as HTMLElement).dataset;
        if (id) {
            this.addUserToChat(+id);
        }
    }
}

export default Chat;
