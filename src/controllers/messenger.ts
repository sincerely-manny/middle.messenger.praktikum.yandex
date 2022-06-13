import { ChatsAPI } from '../api/chats';
import { Chat } from '../blocks/chat';
import ChatsList from '../blocks/chats_list';
import { View } from '../components/view';
import { AppEvent, ETB } from '../modules/eventbus';
import { RTR } from '../modules/router';

class Messenger extends View {
    private static instance:Messenger;

    public chatsList?: ChatsList;

    private _params?: Record<string, string>;

    constructor() {
        super();
        if (Messenger.instance) {
            return Messenger.instance;
        }
        this.init = this.init.bind(this);
        Messenger.instance = this;
    }

    public start(params?: Record<string, string>): void {
        this._params = params;
        ETB.subcribe(AppEvent.CHATS_LIST_IS_Rendered, this.init);
        if (!this.chatsList) {
            ETB.subcribe(AppEvent.CHATS_LIST_HEADER_IS_Rendered, this.bindLinks);
            ETB.subcribe(AppEvent.CHAT_NEWMESSAGE_FORM_IS_Rendered, this.bindNewMessageActions);

            const api = new ChatsAPI();
            api.request().then((c) => {
                this.chatsList = new ChatsList([]);
                c.forEach((v) => {
                    this.chatsList?.chats.push(new Chat(v));
                });
            });
        } else {
            ETB.trigger(AppEvent.CHATS_LIST_IS_Rendered);
            ETB.trigger(AppEvent.CHATS_LIST_HEADER_IS_Rendered);
        }
    }

    public stop() {
        ETB.unsubscribe(AppEvent.CHATS_LIST_IS_Rendered, this.init);
        ETB.unsubscribe(AppEvent.CHATS_LIST_HEADER_IS_Rendered, this.bindLinks);
        if (RTR.root !== 'settings' && RTR.root !== 'messenger') {
            this.chatsList?.unload();
        }
    }

    private init() {
        this.chatsList?.place(this.childById('chats-list', this.childById('container')));
        ETB.trigger(AppEvent.CHATS_LIST_IS_Placed);
        if (this._params?.user_id) {
            this.chatsList?.openChat(Number.parseInt(this._params?.user_id, 10));
        } else {
            this.chatsList?.closeActiveChat();
        }
        this.childById('active-chat', this.childById('container'));
    }

    private bindLinks() {

    }

    private bindNewMessageActions(chat: Chat) {
        const form = chat.element.querySelector('form[name=new_message]') as HTMLFormElement;
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            const values = new FormData(form);
            chat.send(values.get('message') as string);
            form.reset();
        });
    }
}

export default Messenger;
