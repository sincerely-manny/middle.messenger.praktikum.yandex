import { UsersAPI } from '../api/users';
import Block from '../components/block';
import { ETB, AppEvent } from '../modules/eventbus';
import { TE } from '../modules/templatebike';
import { UserSearchResults } from './user_serach_results';

export default class SearchUserForm extends Block {
    private usersAPI: UsersAPI;

    private fn: Function;

    constructor(fn: Function) {
        super();
        this.fn = fn;

        this.usersAPI = new UsersAPI();
        this.searchFormListener = this.searchFormListener.bind(this);
        this.searchLoading = this.searchLoading.bind(this);
        this.searchLoadingStop = this.searchLoadingStop.bind(this);

        ETB.subcribe(AppEvent.USERS_SEARCH_Started, this.searchLoading);
        ETB.subcribe(AppEvent.USERS_SEARCH_Finished, this.searchLoadingStop);
        ETB.subcribe(AppEvent.USERS_SEARCH_Placed, this.hilightRequest);
    }

    protected render(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'search-users-form-container';
        this._isRendered = this.renderAsync();
        return container;
    }

    private async renderAsync() {
        const form = await TE.render('forms/search_user');
        TE.appendTo(this._element, form);
        this.searchFormListener();
        return form;
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
                ETB.trigger(AppEvent.USERS_SEARCH_ToBeClosed, this);
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
            ETB.trigger(AppEvent.USERS_SEARCH_ToBeClosed, this);
        });
        ETB.unsubscribe(AppEvent.CHATS_LIST_HEADER_IS_Rendered, this.searchFormListener);
    }

    private async searchUser(login: string) {
        const resultsBlock = new UserSearchResults(this.fn);
        if (login.length === 0) {
            ETB.trigger(AppEvent.USERS_SEARCH_ToBeClosed, this);
            ETB.trigger(AppEvent.USERS_SEARCH_Finished);
            return;
        }
        ETB.trigger(AppEvent.USERS_SEARCH_Started, this);
        const users = await this.usersAPI.searchUserByLogin(login);
        resultsBlock.users = users;
        const resultsCont = this._element.querySelector('.user-search-results-container');
        if (resultsCont) {
            resultsBlock.place(resultsCont as HTMLElement);
        }
    }

    private searchLoading(instance: typeof this, on = true) {
        if (instance !== this) {
            return;
        }
        const button = this._element.querySelector('form.serach-users>.search-button');
        if (on) {
            button?.classList.add('loading');
        } else {
            button?.classList.remove('loading');
        }
    }

    private searchLoadingStop() {
        this.searchLoading(this, false);
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
