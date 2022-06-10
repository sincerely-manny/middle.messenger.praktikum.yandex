export enum AppEvent {
    CHATS_LIST_IS_Rendered,
    CHATS_LIST_IS_Rendered_async,
    CHATS_LIST_HEADER_IS_Rendered,
    CHATS_LIST_IS_Placed,
    CHAT_LI_IS_Clicked,
    CHAT_IS_Rendered,
    CHAT_NEW_MESSAGES_Prepended,
    CHAT_NEW_MESSAGES_Appended,
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
    PROFILE_IS_Rendered,
    PROFILE_IS_Called,
    PROFILE_IS_Closed,
    ERROR_IS_Called,
    PROFILE_FORM_IS_Submitted,
    PASSWORD_FORM_IS_Submitted,
    INPUT_Focus,
    INPUT_Blur,
    USERDATA_Updated,
    CHAT_TOKEN_Recieved,
    CHAT_NEWMESSAGE_FORM_IS_Rendered,
    SOCKET_MESSAGE_Recieved,
}

type Subscription = {
    [key in AppEvent]: Function[];
};

export class EventTrolleyBus {
    private static instance: EventTrolleyBus;

    public subsctiptions!: Subscription;

    constructor() {
        if (EventTrolleyBus.instance) {
            return EventTrolleyBus.instance;
        }

        this.subsctiptions = {} as Subscription;
        EventTrolleyBus.instance = this;
    }

    public subcribe(event: AppEvent, handler: Function):Function[] {
        if (!this.subsctiptions[event]) {
            this.subsctiptions[event] = [];
        }
        this.subsctiptions[event].push(handler);
        return this.subsctiptions[event];
    }

    public unsubscribe(event: AppEvent, handler: Function | null = null):Function[] {
        if (!this.subsctiptions[event]) {
            this.subsctiptions[event] = [];
        }
        this.subsctiptions[event] = this.subsctiptions[event]
            .filter((h) => !(handler === null || h === handler));
        return this.subsctiptions[event];
    }

    public trigger(event: AppEvent, ...args: any) {
        if (this.subsctiptions[event]) {
            this.subsctiptions[event].forEach((handler) => handler(...args));
            return true;
        }
        return false;
    }
}

export const ETB = new EventTrolleyBus();

export default { AppEvent, EventTrolleyBus, ETB };
