import { ETB, Event } from '../modules/eventbus';
import TemplateBike from '../modules/templatebike';
import { chats } from './chats';
import { ProfileForm, ProfileFormData } from '../components/profileform';
import { appData } from '../modules/applicationdata';

const TE = TemplateBike.getInstance();

let profileForm: ProfileForm;
let passwordForm: ProfileForm;

const forms = {
    profile: {
        action: '#profile',
        onSubmit: (e: any) => {
            e.preventDefault();
            ETB.trigger(Event.PROFILE_FORM_IS_Submitted);
        },
        fields: [
            {
                type: 'text',
                name: 'first_name',
                value: appData.user.first_name,
                label: {
                    value_after: 'Name',
                },
                validate: 'name',
            },
            {
                type: 'text',
                name: 'second_name',
                value: appData.user.second_name,
                label: {
                    value_after: 'Second name',
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
                validate: 'name',
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
            ETB.trigger(Event.PASSWORD_FORM_IS_Submitted);
        },
        submit: 'Change password',
        fields: [
            {
                type: 'password',
                name: 'first_name',
                label: {
                    value_before: 'Old password',
                },
                validate: 'password',
            },
            {
                type: 'password',
                name: 'oldPassword',
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

export async function profile() {
    ETB.trigger(Event.PROFILE_IS_Called);
    await chats();
    profileForm = new ProfileForm(forms.profile as ProfileFormData);
    passwordForm = new ProfileForm(forms.password as ProfileFormData);
    // alert(profileForm.render() instanceof HTMLElement);
    await TE.render('profile/profile', document.getElementById('active-chat'), {
        profile_form: profileForm.render(),
        password_form: passwordForm.render(),
    });
    const avatar = await TE.render('profile/avatar_input', null);
    TE.prependTo(profileForm.form as Element, avatar);
}

ETB.subcribe(Event.PROFILE_FORM_IS_Submitted, () => profileForm.logObject());
ETB.subcribe(Event.PASSWORD_FORM_IS_Submitted, () => passwordForm.logObject());

export default { profile };
