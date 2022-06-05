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
            this.chatsList = new ChatsList();
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
        document.querySelector('#chats-list-header .profile-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            RTR.go('settings');
        });
    }
}

export default Messenger;
