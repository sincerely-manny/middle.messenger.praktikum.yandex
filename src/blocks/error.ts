import Block from '../components/block';
import { TE } from '../modules/templatebike';

export const errors = {
    e404: {
        num: 404,
        text: 'Page could not be found',
        comment: 'Do you really need it anyway?',
    },
    e500: {
        num: 500,
        text: 'That’s an error',
        comment: 'But we don’t blame it on you',
    },
};

export class ErrorPage extends Block {
    protected render(): HTMLElement {
        const container = super.render('error');
        this._isRendered = this.renderAsync();
        return container;
    }

    private async renderAsync() {
        return TE.render('errors/error', this.childById('container'), this._props);
    }
}
