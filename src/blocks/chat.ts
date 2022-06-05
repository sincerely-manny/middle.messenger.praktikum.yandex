import { Message } from '../components/message';
import { User } from '../modules/user';
import { users } from '../models/dummy_data/users';
import { chats } from '../models/dummy_data/chats';
import { TE } from '../modules/templatebike';
import weekday from '../utils/weekdays';
import Block from '../components/block';
import { AppEvent, ETB } from '../modules/eventbus';

export interface IChat {
    user_id: number,
    messages: Message[],
}

export class Chat extends Block implements IChat {
    public user_id: number;

    private _messages: Message[];

    public last_message: {
        unread: number,
        preview: string | null,
        time: string,
    };

    public user: User;

    private me: User;

    public listHtmlElement: HTMLElement | undefined;

    constructor(
        props: { user_id: number, messages: Message[], me: User },
    ) {
        super(props);
        this.user_id = props.user_id;
        this.me = props.me;
        if (props.messages.length === 0) {
            this._messages = this.fetchMessages();
        } else {
            this._messages = props.messages;
        }
        this._messages = this._messages.map((m) => new Message(m));
        let preview = this._messages[this._messages.length - 1].text;
        if (preview && preview.length > 90) {
            preview = `${[...preview].slice(0, 90).join('').trim()}...`;
        }
        const unread = this._messages.filter((m) => (m.user_id !== this.me.id && m.status === 'unread')).length;
        let time;
        const { timestamp } = this._messages[this.messages.length - 1];
        const dateObj = new Date(timestamp);
        if ((Date.now() - timestamp) < (60 * 60 * 24 * 5 * 1000)) {
            time = weekday.short[dateObj.getDay()];
        } else {
            time = `${(`0${dateObj.getDate()}`).slice(-2)}.${(`0${dateObj.getMonth() + 1}`).slice(-2)}`;
        }
        this.last_message = {
            unread,
            preview,
            time,
        };
        const user = users.find((e) => {
            if (e.id === this.user_id) {
                return e;
            }
            return false;
        });
        if (user === undefined) {
            this.user = {} as User;
        } else {
            this.user = user;
        }
    }

    public get messages() {
        return this._messages;
    }

    public set messages(_messages) {
        throw new Error('access denied');
    }

    public fetchMessages() {
        const chat = chats.find((e) => {
            if (e.user_id === this.user_id) {
                return e;
            }
            return false;
        });
        let messages: Message[];
        if (chat === undefined) {
            messages = [] as Message[];
        } else {
            messages = chat.messages as Message[];
        }
        return messages;
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
        const activeChat = TE.render('chat/active_chat', this._element, this);
        const msgContainer = (await activeChat)[0].querySelector('#active-chat-messages') as HTMLElement;
        const newMsgContainer = (await activeChat)[0].querySelector('#active-chat-new-message') as HTMLElement;
        this.renderMessages(this, msgContainer).then(() => {
            ETB.trigger(AppEvent.CHAT_IS_Rendered, this);
        });
        TE.render('chat/new_message_form', newMsgContainer);
        [this._element] = (await activeChat);
        return activeChat;
    }

    private async renderMessages(chat: Chat, msgContainer: HTMLElement | null) {
        let sender = {} as User;
        let currShownDate: string | undefined;

        // eslint-disable-next-line no-restricted-syntax
        for (const message of chat.messages) {
            let newDate = false;
            if (currShownDate !== message.date) {
                currShownDate = message.date;
                newDate = true;
                await TE.render('messages/date', msgContainer, message);
            }
            if (sender.id !== message.user_id || newDate) {
                if (message.user_id === this.me.id) {
                    sender = this.me;
                } else if (message.user_id === chat.user_id) {
                    sender = chat.user;
                }
                await TE.render('messages/sender', msgContainer, sender);
            }
            if (message.img_attachment !== undefined) {
                [message.htmlElement] = await TE.render('messages/message_img', msgContainer, message);
            } else {
                [message.htmlElement] = await TE.render('messages/message', msgContainer, message);
            }
        }
        return msgContainer;
    }

    public async place(parent: HTMLElement) {
        await super.place(parent);
        ETB.trigger(AppEvent.CHAT_IS_Placed, this);
        return this._element;
    }
}

export default Chat;
