import { ETB, Event } from '../modules/eventbus';
import TemplateBike from '../modules/templatebike';

const TE = TemplateBike.getInstance();

const errors = {
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

function e404() {
    TE.render('errors/error', document.getElementById('container'), errors.e404);
}

function e500() {
    TE.render('errors/error', document.getElementById('container'), errors.e500);
}

export function error(e: 404 | 500 = 404) {
    ETB.trigger(Event.ERROR_IS_Called, e);
    const container = document.getElementById('container');
    if (container) {
        container.innerHTML = '';
    }
    switch (e) {
        case 500:
            e500();
            break;
        case 404:
        default:
            e404();
            break;
    }
}

export default { error };
