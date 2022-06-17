import Block from './block';

export enum InappNotificationStatus {
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
    NOTICE = 'notice',
}

export class InappNotification extends Block {
    private static instance:InappNotification;

    private notifications: HTMLElement[] = [];

    constructor(props: Record<string, any> = {}) {
        if (InappNotification.instance) {
            return InappNotification.instance;
        }
        super(props);
        InappNotification.instance = this;
    }

    protected render() {
        const cont = super.render();
        this.childById('notifitation-area', this.childById('container'));
        return cont;
    }

    public notify(text: string, status: InappNotificationStatus = InappNotificationStatus.NOTICE) {
        this.place(this.childById('notifitation-area'));
        const notification = document.createElement('section');
        notification.classList.add('notification', `notification-${status}`, 'notification-off');
        notification.textContent = text;
        this.notifications.push(notification);
        this._element.prepend(notification);
        setTimeout(() => {
            this.notificationOnOff(notification, true);
        }, 100);
        const timeoutFn = this.timeout.bind(this);
        let offTimeout = timeoutFn(notification);
        notification.addEventListener('mousemove', () => {
            notification.classList.remove('notification-fade');
            offTimeout = timeoutFn(notification, offTimeout);
        });
        notification.addEventListener('click', () => {
            this.notificationOnOff(notification, false);
        });
    }

    public notificationOnOff(notifitation: HTMLElement, on = true) {
        if (on) {
            notifitation.classList.add('notification-on');
            notifitation.classList.remove('notification-off');
        } else {
            notifitation.classList.add('notification-off');
            notifitation.classList.remove('notification-on');
            setTimeout(() => {
                notifitation.remove();
            }, 500);
        }
    }

    private timeout(notification: HTMLElement, timer?: ReturnType<typeof setTimeout>) {
        clearTimeout(timer);
        setTimeout(() => {
            notification.classList.add('notification-fade');
        }, 300);
        return setTimeout(this.notificationOnOff, 10000, notification, false);
    }
}

export default { InappNotification, InappNotificationStatus };
