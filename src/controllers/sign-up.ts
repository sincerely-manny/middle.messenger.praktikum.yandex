import { SignInUpForm, formData } from '../blocks/signinup';
import { ModalForm } from '../components/modalform';
import { View } from '../components/view';
import { AppEvent, ETB } from '../modules/eventbus';
import { RTR } from '../modules/router';

export default class SignUp extends View {
    private static instance: SignUp;

    private form?: SignInUpForm;

    constructor() {
        super();
        if (SignUp.instance) {
            return SignUp.instance;
        }
        SignUp.instance = this;
    }

    public start(_params?: Record<string, string> | undefined): void {
        if (!this.form) {
            this.form = new SignInUpForm(formData.signUp);
        }
        this.form.place(this.childById('conainer'));
        this.childById('chats-list', this.childById('container'));
        ETB.subcribe(AppEvent.MODAL_FORM_IS_Submitted, this.onSubmit);
    }

    public stop(): void {
        ETB.unsubscribe(AppEvent.MODAL_FORM_IS_Submitted, this.onSubmit);
        this.form?.unload();
    }

    private onSubmit(_mf: ModalForm) {
        RTR.go('messenger');
    }
}
