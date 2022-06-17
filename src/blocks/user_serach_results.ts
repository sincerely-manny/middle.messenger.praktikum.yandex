import Block from '../components/block';
import { ETB, AppEvent } from '../modules/eventbus';
import { TE } from '../modules/templatebike';
import { User } from '../modules/user';
import { replaceOnError } from '../utils/dummyavatar';

export class UserSearchResults extends Block {
    private fn: Function;

    constructor(fn: Function) {
        super();
        this.fn = fn;
        this._props = [];

        this.close = this.close.bind(this);
        ETB.subcribe(AppEvent.USERS_SEARCH_ToBeClosed, this.close);
    }

    public set users(data: User[]) {
        this._props = data;
        this._isRendered = this.renderAsync(this._element);
    }

    protected render(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'user-search-results_container';
        this._isRendered = this.renderAsync(container);
        return container;
    }

    private async renderAsync(container: HTMLElement) {
        // eslint-disable-next-line no-param-reassign
        container.innerHTML = '';
        if (!Array.isArray(this._props)) {
            return [document.createElement('div')];
        }
        const resultsBlock = await TE.render('forms/search_results', container, { users: this._props });
        resultsBlock[0].querySelectorAll('img').forEach((img) => {
            replaceOnError(img, (img.alt || '0'));
        });
        resultsBlock[0].querySelectorAll('li').forEach((li) => {
            li.addEventListener('click', (e) => {
                this.fn(e);
            });
        });
        return resultsBlock;
    }

    public async place(parent: HTMLElement): Promise<HTMLElement> {
        const promise = super.place(parent);
        promise.then((e) => {
            ETB.trigger(AppEvent.USERS_SEARCH_Placed, e);
        });
        return promise;
    }

    public close() {
        this.unload();
    }
}

export default { UserSearchResults };
