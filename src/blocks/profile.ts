import Block from '../components/block';
import { ProfileForm, ProfileFormData } from '../components/profileform';
import { appData } from '../modules/appdata';
import { AppEvent, ETB } from '../modules/eventbus';
import { TE } from '../modules/templatebike';

function getFormsProps() {
    return {
        profile: {
            action: '#profile',
            onSubmit: (e: any) => {
                e.preventDefault();
                ETB.trigger(AppEvent.PROFILE_FORM_IS_Submitted);
            },
            submit: 'Save changes',
            fields: [
                {
                    type: 'text',
                    name: 'first_name',
                    value: appData.user.first_name,
                    label: {
                        value_after: 'First name',
                    },
                    validate: 'name',
                },
                {
                    type: 'text',
                    name: 'second_name',
                    value: appData.user.second_name,
                    label: {
                        value_after: 'Last name',
                    },
                    validate: 'name',
                },
                {
                    type: 'text',
                    name: 'email',
                    value: appData.user.email,
                    label: {
                        value_before: 'E-mail:',
                    },
                    validate: 'email',
                },
                {
                    type: 'text',
                    name: 'login',
                    value: appData.user.login,
                    label: {
                        value_before: 'Login:',
                    },
                    validate: 'username',
                },
                {
                    type: 'text',
                    name: 'display_name',
                    value: appData.user.display_name,
                    label: {
                        value_before: 'Visible name:',
                    },
                    validate: 'displayname',
                },
                {
                    type: 'text',
                    name: 'phone',
                    value: appData.user.phone,
                    label: {
                        value_before: 'Phone:',
                    },
                    validate: 'phone',
                },
            ],
        },
        password: {
            action: '#profile',
            onSubmit: (e: any) => {
                e.preventDefault();
                ETB.trigger(AppEvent.PASSWORD_FORM_IS_Submitted);
            },
            submit: 'Change password',
            fields: [
                {
                    type: 'password',
                    name: 'oldPassword',
                    label: {
                        value_before: 'Old password',
                    },
                    validate: 'password',
                },
                {
                    type: 'password',
                    name: 'newPassword',
                    label: {
                        value_before: 'New password',
                        value_after: '1 lowercase letter, 1 uppercase letter, 1 number, at least 8 characters long',
                    },
                    validate: 'password',
                },
                {
                    type: 'password',
                    name: 'newPasswordRepeat',
                    label: {
                        value_before: 'New password',
                        value_after: 'One more time',
                    },
                    validate: 'password',
                },
            ],
        },
    };
}

export class Profile extends Block {
    private static instance: Profile;

    public profileForm?: ProfileForm;

    public passwordForm?: ProfileForm;

    constructor() {
        if (Profile.instance) {
            return Profile.instance;
        }
        super(appData);
        this.render = this.render.bind(this);
        ETB.subcribe(AppEvent.USERDATA_Updated, this.render);
        Profile.instance = this;
    }

    public render(): HTMLElement {
        const container = super.render('user-profile');
        this._isRendered = this.renderAsync();
        return container;
    }

    private async renderAsync() {
        const forms = getFormsProps();
        this.profileForm = new ProfileForm(forms.profile as ProfileFormData);
        this.passwordForm = new ProfileForm(forms.password as ProfileFormData);
        const block = await TE.render('profile/profile', null, {
            profile_form: this.profileForm?.render(),
            password_form: this.passwordForm?.render(),
        });
        TE.appendTo(this._element, block);
        const avatar = await TE.render('profile/avatar_input', null, appData);
        TE.prependTo(this.profileForm?.form as HTMLElement, avatar);
        ETB.trigger(AppEvent.PROFILE_IS_Rendered);
        return block;
    }
}

export default { Block };
