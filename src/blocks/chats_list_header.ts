import Block from '../components/block';
import { ETB, AppEvent } from '../modules/eventbus';
import { RTR } from '../modules/router';
import { TE } from '../modules/templatebike';
import SearchUserForm from './search_user_form';

export class ChatsListHeader extends Block {
    private static instance:ChatsListHeader;

    private createFn: Function;

    constructor(createFn: Function) {
        super();
        this.createFn = createFn;
        if (ChatsListHeader.instance) {
            return ChatsListHeader.instance;
        }

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
        const searchUserForm = new SearchUserForm(this.createFn);
        searchUserForm.place(header[2]);
        ETB.trigger(AppEvent.CHATS_LIST_HEADER_IS_Rendered);
        return header;
    }
}

export default { ChatsListHeader };
