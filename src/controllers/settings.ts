import { LoguotAPI } from '../api/logout';
import { Profile } from '../blocks/profile';
import { InappNotification, InappNotificationStatus } from '../components/notification';
import { View } from '../components/view';
import { appData } from '../modules/appdata';
import { AppEvent, ETB } from '../modules/eventbus';
import { RTR } from '../modules/router';
import Messenger from './messenger';
import { UpdatePasswordData, UpdateUserData, UserinfoAPI } from '../api/userinfo';
import { replaceOnError } from '../utils/dummyavatar';

export default class Settings extends View {
    private static instance:Settings;

    private profile?: Profile;

    private messenger?: Messenger;

    constructor() {
        super();
        if (Settings.instance) {
            return Settings.instance;
        }
        this.init = this.init.bind(this);
        this.classActive = this.classActive.bind(this);
        this.bindEvents = this.bindEvents.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        Settings.instance = this;
    }

    public start(_params?: Record<string, string>): void {
        ETB.subcribe(AppEvent.CHATS_LIST_IS_Placed, this.init);
        ETB.subcribe(AppEvent.CHATS_LIST_HEADER_IS_Rendered, this.classActive);
        if (!this.messenger) {
            this.messenger = new Messenger();
        }
        if (!this.profile) {
            ETB.subcribe(AppEvent.PROFILE_IS_Rendered, this.bindEvents);
            this.profile = new Profile();
        }
        this.messenger.start();

        ETB.subcribe(AppEvent.PROFILE_FORM_IS_Submitted, this.updateProfile);
        ETB.subcribe(AppEvent.PASSWORD_FORM_IS_Submitted, this.updatePassword);
    }

    public stop(): void {
        this.classActive(false);
        this.profile?.unload();
        ETB.unsubscribe(AppEvent.CHATS_LIST_IS_Placed, this.init);
        ETB.unsubscribe(AppEvent.CHATS_LIST_HEADER_IS_Rendered, this.classActive);
        ETB.unsubscribe(AppEvent.PROFILE_FORM_IS_Submitted, this.updateProfile);
        ETB.unsubscribe(AppEvent.PASSWORD_FORM_IS_Submitted, this.updatePassword);
        this.messenger?.stop();
    }

    private init() {
        this.profile?.place(this.childById('active-chat', this.childById('container')));
    }

    private classActive(on: boolean = true) {
        const classList = this.messenger?.chatsList?.element.querySelector('#chats-list-header .profile-link')?.classList;
        const aClass = 'active';
        if (on) {
            classList?.add(aClass);
        } else {
            classList?.remove(aClass);
        }
    }

    private bindEvents() {
        this.profile?.element.querySelector('.goback-button')?.addEventListener('click', (e) => {
            e.preventDefault();
            RTR.go('messenger');
        });
        this.profile?.element.querySelector('.logout-button')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
        this.profile?.element.querySelector('#avatar_input')?.addEventListener('change', () => {
            this.updateAvatar();
        });
        replaceOnError(this.profile?.element.querySelector('#avatar_preview'));
    }

    private logout() {
        const logoutAPI = new LoguotAPI();
        logoutAPI.request().then((r) => {
            if (r === 'OK') {
                appData.deleteUser();
                RTR.go('sign-in');
            } else {
                const NTF = new InappNotification();
                NTF.notify(r.reason, InappNotificationStatus.ERROR);
            }
        });
    }

    private updateProfile() {
        const form = this.profile?.profileForm;
        const api = new UserinfoAPI();
        const NTF = new InappNotification();
        if (form?.submitBtn) {
            form.submitBtn.disabled = true;
        }
        const formValues = new FormData(form?.form);
        const data: UpdateUserData = {
            first_name: formValues.get('first_name') as string,
            second_name: formValues.get('second_name') as string,
            login: formValues.get('login') as string,
            display_name: formValues.get('display_name') as string,
            email: formValues.get('email') as string,
            phone: formValues.get('phone') as string,
        };
        api.update(data).then((r) => {
            if (r.reason) {
                NTF.notify(r.reason, InappNotificationStatus.ERROR);
            } else {
                NTF.notify('Profile updaeted', InappNotificationStatus.INFO);
                appData.user = r;
            }
            if (form?.submitBtn) {
                form.submitBtn.disabled = false;
            }
        });
    }

    private updatePassword() {
        const form = this.profile?.passwordForm;
        const api = new UserinfoAPI();
        const NTF = new InappNotification();
        if (form?.submitBtn) {
            form.submitBtn.disabled = true;
        }
        const formValues = new FormData(form?.form);
        const data: UpdatePasswordData = {
            oldPassword: formValues.get('oldPassword') as string,
            newPassword: formValues.get('newPassword') as string,
        };
        const newPasswordRepeat = formValues.get('newPasswordRepeat') as string;
        if (data.newPassword !== newPasswordRepeat) {
            NTF.notify('New passwords do not match', InappNotificationStatus.ERROR);
            if (form?.submitBtn) {
                form.submitBtn.disabled = false;
            }
            return;
        }
        api.updatePassword(data).then((r) => {
            if (r === 'OK') {
                NTF.notify('Password updated', InappNotificationStatus.INFO);
                form?.inputs?.forEach((i) => {
                    // eslint-disable-next-line no-param-reassign
                    i.html.value = '';
                });
            } else {
                NTF.notify(r.reason, InappNotificationStatus.ERROR);
            }
            if (form?.submitBtn) {
                form.submitBtn.disabled = false;
            }
        });
    }

    private updateAvatar() {
        const form = this.profile?.profileForm;
        const api = new UserinfoAPI();
        const NTF = new InappNotification();
        const fileinput = form?.form?.querySelector('#avatar_input') as HTMLInputElement;

        if (form?.submitBtn) {
            form.submitBtn.disabled = true;
        }
        const formValues = new FormData();
        if (fileinput.files) {
            formValues.append('avatar', fileinput.files[0]);
        } else {
            NTF.notify('No file selected', InappNotificationStatus.ERROR);
            if (form?.submitBtn) {
                form.submitBtn.disabled = false;
            }
            return;
        }
        api.updateAvatar(formValues).then((r) => {
            if (r.reason) {
                NTF.notify(r.reason, InappNotificationStatus.ERROR);
            } else {
                NTF.notify('Avatar updated', InappNotificationStatus.INFO);
                appData.user = r;
            }
            if (form?.submitBtn) {
                form.submitBtn.disabled = false;
            }
        }).catch(() => {
            NTF.notify('Unknown error', InappNotificationStatus.ERROR);
            if (form?.submitBtn) {
                form.submitBtn.disabled = false;
            }
        });
    }
}
