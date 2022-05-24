export enum Event {
    CHAT_LI_IS_Clicked,
    CHAT_IS_Rendered,
    CHAT_IS_Placed,
    CHAT_IS_Closed,
    NOCHAT_IS_Placed,
    KEY_PRESSED_Escape,
    MODAL_IS_Rendered,
    MODAL_IS_Placed,
    MODAL_FORM_IS_Submitted,
    MODAL_SignIn_IS_Called,
    MODAL_SignUp_IS_Called,
    MODAL_IS_Closed,
    PROFILE_IS_Called,
    PROFILE_IS_Closed,
    ERROR_IS_Called,
    PROFILE_FORM_IS_Submitted,
    PASSWORD_FORM_IS_Submitted,
    INPUT_Focus,
    INPUT_Blur,
}

type Subscription = {
    [key in Event]: Function[];
};

export class EventTrolleyBus {
    private static instance: EventTrolleyBus;

    public subsctiptions: Subscription;

    private constructor() {
        this.subsctiptions = {} as Subscription;
    }

    public static getInstance(): EventTrolleyBus {
        if (!EventTrolleyBus.instance) {
            EventTrolleyBus.instance = new EventTrolleyBus();
        }

        return EventTrolleyBus.instance;
    }

    public subcribe(event: Event, handler: Function):Function[] {
        if (!this.subsctiptions[event]) {
            this.subsctiptions[event] = [];
        }
        this.subsctiptions[event].push(handler);
        return this.subsctiptions[event];
    }

    public unsubscribe(event: Event, handler: Function | null = null):Function[] {
        if (!this.subsctiptions[event]) {
            this.subsctiptions[event] = [];
        }
        this.subsctiptions[event] = this.subsctiptions[event]
            .filter((h) => !(handler === null || h === handler));
        return this.subsctiptions[event];
    }

    public trigger(event: Event, ...args: any) {
        if (this.subsctiptions[event]) {
            this.subsctiptions[event].forEach((handler) => handler(...args));
            return true;
        }
        // throw new Error(`Нет события ${Event[event]}`);
        return false;
    }
}

export const ETB = EventTrolleyBus.getInstance();

export default { Event, EventTrolleyBus, ETB };
