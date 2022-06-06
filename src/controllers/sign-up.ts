import { SignupAPI, SignupUserData } from '../api/signup';
import { UserinfoAPI } from '../api/userinfo';
import { SignInUpForm, formData } from '../blocks/signinup';
import { ModalForm } from '../components/modalform';
import { InappNotification, InappNotificationStatus } from '../components/notification';
import { View } from '../components/view';
import { appData } from '../modules/appdata';
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

    public async start(_params?: Record<string, string> | undefined): Promise<void> {
        const userinfoAPI = new UserinfoAPI();
        const userinfo = await userinfoAPI.isLoggedIn();
        if (userinfo) {
            appData.user = userinfo;
            RTR.go('messenger');
            return;
        }

        if (!this.form) {
            this.form = new SignInUpForm(formData.signUp);
        }
        this.childById('container').innerHTML = '';
        this.childById('chats-list', this.childById('container'));
        this.form.place(this.childById('modal-form-container', this.childById('container')));
        ETB.subcribe(AppEvent.MODAL_FORM_IS_Submitted, this.onSubmit);
    }

    public stop(): void {
        ETB.unsubscribe(AppEvent.MODAL_FORM_IS_Submitted, this.onSubmit);
        this.form?.unload();
    }

    private onSubmit(mf: ModalForm) {
        const NTF = new InappNotification();
        const invalid = mf.inputs?.filter((i) => (!i.validate()));
        if (invalid && invalid.length > 0) {
            invalid.forEach((i) => {
                NTF.notify(`${i.html.placeholder} is invalid`, InappNotificationStatus.ERROR);
            });
            return false;
        }
        const api = new SignupAPI();
        const formValues = new FormData(mf.form);
        const data: Record<string, string> = {};
        ([
            'first_name',
            'second_name',
            'login',
            'email',
            'password',
            'phone',
        ] as Array<keyof SignupUserData>).forEach((e) => {
            const val = formValues.get(e);
            if (val) {
                data[e] = val as string;
            } else {
                throw new Error(`${e} cannot be empty`);
            }
        });
        api.create(data as SignupUserData).then((response) => {
            if (response.reason) {
                NTF.notify(response.reason, InappNotificationStatus.ERROR);
            } else {
                RTR.go('messenger');
            }
        });
        return true;
    }
}
