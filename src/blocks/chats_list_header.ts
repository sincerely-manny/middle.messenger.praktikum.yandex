import { UsersAPI } from '../api/users';
import Block from '../components/block';
import { ETB, AppEvent } from '../modules/eventbus';
import { RTR } from '../modules/router';
import { TE } from '../modules/templatebike';
import { UserSearchResults } from './user_serach_results';

export class ChatsListHeader extends Block {
    private static instance:ChatsListHeader;

    private usersAPI!: UsersAPI;

    constructor() {
        super();
        if (ChatsListHeader.instance) {
            return ChatsListHeader.instance;
        }
        this.usersAPI = new UsersAPI();

        this.searchFormListener = this.searchFormListener.bind(this);
        this.searchLoading = this.searchLoading.bind(this);
        this.searchLoadingStop = this.searchLoadingStop.bind(this);
        ETB.subcribe(AppEvent.CHATS_LIST_HEADER_IS_Rendered, this.searchFormListener);
        ETB.subcribe(AppEvent.USERS_SEARCH_Started, this.searchLoading);
        ETB.subcribe(AppEvent.USERS_SEARCH_Finished, this.searchLoadingStop);
        ETB.subcribe(AppEvent.USERS_SEARCH_Placed, this.hilightRequest);

        ChatsListHeader.instance = this;
    }

    protected render(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'chats-list-header_container';
        this._isRendered = this.renderAsync(container);
        return container;
    }

    private async renderAsync(container: HTMLElement) {
        const header = await TE.render('chats_list/header', container);
        header[0]?.addEventListener('click', (e) => {
            e.preventDefault();
            RTR.go('settings');
        });
        if (RTR.root === 'settings') {
            header[0]?.classList.add('active');
        }
        ETB.trigger(AppEvent.CHATS_LIST_HEADER_IS_Rendered);
        return header;
    }

    private searchFormListener() {
        const form = this._element.querySelector('form.serach-users');
        let timer: ReturnType<typeof setTimeout>;
        const fn = () => {
            const val = (form?.querySelector('input[name=serach-users]') as HTMLInputElement).value;
            this.searchUser(val);
        };

        form?.addEventListener('keyup', (e) => {
            const { key } = e as KeyboardEvent;
            if (key === 'Escape') {
                e.stopPropagation();
                ETB.trigger(AppEvent.USERS_SEARCH_ToBeClosed);
            } else if (key !== 'Enter') {
                clearTimeout(timer);
                timer = setTimeout(fn, 300);
            }
        });
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            fn();
        });
        form?.addEventListener('focusin', (e) => {
            if (form.contains((e as FocusEvent).relatedTarget as Node)) return;
            fn();
        });
        form?.addEventListener('focusout', (e) => {
            if (form.contains((e as FocusEvent).relatedTarget as Node)) return;
            ETB.trigger(AppEvent.USERS_SEARCH_ToBeClosed);
        });
        ETB.unsubscribe(AppEvent.CHATS_LIST_HEADER_IS_Rendered, this.searchFormListener);
    }

    private async searchUser(login: string) {
        const resultsBlock = new UserSearchResults();
        if (login.length === 0) {
            ETB.trigger(AppEvent.USERS_SEARCH_ToBeClosed);
            ETB.trigger(AppEvent.USERS_SEARCH_Finished);
            return;
        }
        ETB.trigger(AppEvent.USERS_SEARCH_Started);
        const users = await this.usersAPI.searchUserByLogin(login);
        resultsBlock.users = users;
        resultsBlock.place(this.childById('user-search-results-container', this._element));
    }

    private searchLoading(on = true) {
        const button = this._element.querySelector('form.serach-users>.search-button');
        if (on) {
            button?.classList.add('loading');
        } else {
            button?.classList.remove('loading');
        }
    }

    private searchLoadingStop() {
        this.searchLoading(false);
    }

    private hilightRequest(el: HTMLElement) {
        const login = (el.parentElement?.querySelector('input[name=serach-users]') as HTMLInputElement).value;
        el.querySelectorAll('p.login').forEach((p) => {
            // eslint-disable-next-line no-param-reassign
            p.innerHTML = p.innerHTML.replace(login, `<span>${login}</span>`);
        });
        ETB.trigger(AppEvent.USERS_SEARCH_Finished);
    }
}

export default { ChatsListHeader };
