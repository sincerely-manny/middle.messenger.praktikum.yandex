import { Profile } from '../blocks/profile';
import { View } from '../components/view';
import { AppEvent, ETB } from '../modules/eventbus';
import { RTR } from '../modules/router';
import Messenger from './messenger';

export default class Settings extends View {
    private static instance:Settings;

    private profile?: Profile;

    private messenger?: Messenger;

    constructor() {
        super();
        if (Settings.instance) {
            return Settings.instance;
        }
        this.init = this.init.bind(this);
        this.classActive = this.classActive.bind(this);
        this.bindLinks = this.bindLinks.bind(this);
        Settings.instance = this;
    }

    public start(_params?: Record<string, string>): void {
        ETB.subcribe(AppEvent.CHATS_LIST_IS_Placed, this.init);
        ETB.subcribe(AppEvent.CHATS_LIST_HEADER_IS_Rendered, this.classActive);
        if (!this.messenger) {
            this.messenger = new Messenger();
        }
        if (!this.profile) {
            ETB.subcribe(AppEvent.PROFILE_IS_Rendered, this.bindLinks);
            this.profile = new Profile();
        }
        this.messenger.start();
    }

    public stop(): void {
        this.classActive(false);
        this.profile?.unload();
        ETB.unsubscribe(AppEvent.CHATS_LIST_IS_Placed, this.init);
        ETB.unsubscribe(AppEvent.CHATS_LIST_HEADER_IS_Rendered, this.classActive);
        ETB.unsubscribe(AppEvent.PROFILE_IS_Rendered, this.bindLinks);
        this.messenger?.stop();
    }

    private init() {
        this.profile?.place(this.childById('active-chat', this.childById('container')));
    }

    private classActive(on: boolean = true) {
        const classList = this.messenger?.chatsList?.element.querySelector('#chats-list-header .profile-link')?.classList;
        const aClass = 'active';
        if (on) {
            classList?.add(aClass);
        } else {
            classList?.remove(aClass);
        }
    }

    private bindLinks() {
        this.profile?.element.querySelector('.goback-button')?.addEventListener('click', (e) => {
            e.preventDefault();
            RTR.go('messenger');
        });
    }
}
