import { ETB, Event } from '../modules/eventbus';
import { ModalForm, ModalFormData } from '../components/modalform';
import TemplateBike from '../modules/templatebike';

const TE = TemplateBike.getInstance();

let mf: ModalForm | undefined;

const formData = {
    signIn: {
        header: 'Sign in',
        message: 'Don’t have an account?',
        link: {
            text: 'Sign up',
            href: '#signup',
            onclick: () => {
                ETB.trigger(Event.MODAL_SignUp_IS_Called);
            },
        },
        fields: [
            {
                type: 'text',
                value: '',
                placeholder: 'Login',
                name: 'login',
                class: '',
                validate: 'username',
            },
            {
                type: 'password',
                value: '',
                placeholder: 'Password',
                name: 'password',
                class: '',
                validate: 'password',
            },
        ],
        onSubmit: () => {},
    } as ModalFormData,
    signUp: {
        header: 'Sign up',
        message: 'Already have an account?',
        link: {
            text: 'Sign in',
            href: '#signin',
            onclick: () => {
                ETB.trigger(Event.MODAL_SignIn_IS_Called);
            },
        },
        fields: [
            {
                type: 'text',
                value: '',
                placeholder: 'E-mail',
                name: 'email',
                class: '',
                validate: 'email',
            },
            {
                type: 'text',
                value: '',
                placeholder: 'Login',
                name: 'login',
                class: '',
                validate: 'username',
            },
            {
                type: 'text',
                value: '',
                placeholder: 'First name',
                name: 'first_name',
                class: '',
                validate: 'name',
            },
            {
                type: 'text',
                value: '',
                placeholder: 'Second name',
                name: 'second_name',
                class: '',
                validate: 'name',
            },
            {
                type: 'text',
                value: '',
                placeholder: 'Phone number',
                name: 'phone',
                class: '',
                validate: 'phone',
            },
            {
                type: 'password',
                value: '',
                placeholder: 'Password',
                name: 'password',
                class: '',
                validate: 'password',
            },
            {
                type: 'password',
                value: '',
                placeholder: 'Password (one more time)',
                name: 'password_repeat',
                class: '',
                validate: 'password',
            },
        ],
        onSubmit: () => {},
    } as ModalFormData,
};

async function placeModal(fd: ModalFormData) {
    mf = new ModalForm(
        {
            ...fd,
            onSubmit: (e: any) => {
                e.preventDefault();
                ETB.trigger(Event.MODAL_FORM_IS_Submitted, mf);
            },
        },
    );
    const container = document.getElementById('container');
    const mfHtml = await mf.render();
    ETB.trigger(Event.MODAL_IS_Rendered);
    if (container) {
        container.append(mfHtml);
        ETB.trigger(Event.MODAL_IS_Placed);
    }
}

function signIn() {
    if (!mf) {
        placeModal(formData.signIn);
    } else {
        mf.props = {
            ...formData.signIn,
            onSubmit: (e: any) => {
                e.preventDefault();
                ETB.trigger(Event.MODAL_FORM_IS_Submitted, mf);
            },
        };
    }
}

function signUp() {
    if (!mf) {
        placeModal(formData.signUp);
    } else {
        mf.props = {
            ...formData.signUp,
            onSubmit: (e: any) => {
                e.preventDefault();
                ETB.trigger(Event.MODAL_FORM_IS_Submitted, mf);
            },
        };
    }
}

function blurBg(on: boolean = true) {
    ['chats-list', 'active-chat'].forEach((e) => {
        const elem = document.getElementById(e);
        if (elem) {
            elem.style.filter = on ? 'blur(10px)' : 'blur(0px)';
        }
    });
}

export async function login(f: 'signin' | 'signup' = 'signin') {
    if (!document.getElementById('chats-list')) {
        const container = document.getElementById('container');
        if (container) {
            container.innerHTML = '';
        }
        await TE.render('general/main', document.getElementById('container'));
    }
    blurBg();
    switch (f) {
        case 'signup':
            signUp();
            break;
        case 'signin':
        default:
            signIn();
            break;
    }
}

export function close() {
    blurBg(false);
    ETB.trigger(Event.MODAL_IS_Closed, mf);
    mf?.destroy();
    mf = undefined;
}

ETB.subcribe(Event.MODAL_FORM_IS_Submitted, (m: ModalForm) => { m.logObject(); });
ETB.subcribe(Event.MODAL_FORM_IS_Submitted, close);
ETB.subcribe(Event.MODAL_FORM_IS_Submitted, () => { window.location.hash = 'chat'; });
ETB.subcribe(Event.PROFILE_IS_Called, close);
ETB.subcribe(Event.ERROR_IS_Called, close);
ETB.subcribe(Event.CHAT_LI_IS_Clicked, close);

export default { login, close };
