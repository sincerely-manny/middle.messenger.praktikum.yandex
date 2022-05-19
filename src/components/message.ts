export interface IMessage {
    id: number,
    user_id: number,
    text: string | null,
    img_attachment?: string | null,
    timestamp: number,
    status: 'sent' | 'delivered' | 'unread' | 'read',
}

export class Message implements IMessage {
    id!: number;

    user_id!: number;

    text!: string | null;

    img_attachment?: string | null | undefined;

    timestamp!: number;

    status!: 'sent' | 'delivered' | 'unread' | 'read';

    date: string;

    time: string;

    htmlElement: Element | undefined;

    constructor(_message: IMessage) {
        Object.assign(this, _message);
        const date = new Date(this.timestamp);
        this.date = date.toLocaleDateString();
        this.time = date.toLocaleTimeString('ru-RU').slice(0, -3);
    }
}

export default Message;
