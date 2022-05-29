import Block from '../components/block';
import { ModalForm, ModalFormData } from '../components/modalform';
import { AppEvent, ETB } from '../modules/eventbus';

export const formData = {
    signIn: {
        header: 'Sign in',
        message: 'Don’t have an account?',
        link: {
            text: 'Sign up',
            href: '#signup',
            onclick: () => {
                ETB.trigger(AppEvent.MODAL_SignUp_IS_Called);
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
                ETB.trigger(AppEvent.MODAL_SignIn_IS_Called);
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

export class SignInUpForm extends Block {
    protected render(): HTMLElement {
        const container = super.render('modal-form');
        this._isRendered = this.renderAsync();
        return container;
    }

    protected async renderAsync() {
        const mf = new ModalForm(
            {
                ...this._props,
                onSubmit: (e: any) => {
                    e.preventDefault();
                    ETB.trigger(AppEvent.MODAL_FORM_IS_Submitted, mf);
                },
            } as ModalFormData,

        );
        const mfHtml = await mf.render();
        ETB.trigger(AppEvent.MODAL_IS_Rendered);
        this._element.append(mfHtml);
        return [mfHtml];
    }
}

export default { formData, SignInUpForm };
