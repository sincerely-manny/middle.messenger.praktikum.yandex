import twoDigit from '../utils/twodigit';
import weekday from '../utils/weekdays';

export interface IFileAttachment {
    id: number,
    user_id: number,
    path: string,
    filename: string,
    content_type: string,
    content_size: number,
    upload_date: string,
}

export interface IMessage {
    id: number,
    chat_id: number,
    time: string,
    type: string,
    user_id: string,
    content: string,
    file?: IFileAttachment,
}

export class Message implements IMessage {
    id!: number;

    chat_id!: number;

    time!: string;

    type!: string;

    user_id!: string;

    content!: string;

    file?: IFileAttachment | undefined;

    status?: 'sent' | 'delivered' | 'unread' | 'read';

    htmlElement?: HTMLElement;

    datePretty?: string;

    timePretty?: string;

    dateTimePretty?: string;

    constructor(message: IMessage) {
        Object.assign(this, message);
        if (this.time) {
            this.prettyfyDate();
        }
    }

    private prettyfyDate() {
        const date = new Date(this.time);
        this.datePretty = date.toLocaleDateString();
        this.timePretty = date.toLocaleTimeString('ru-RU').slice(0, -3);
        const msAgo = Date.now() - date.getTime();
        if (msAgo < (60 * 60 * 23 * 1000)) {
            this.dateTimePretty = `${twoDigit(date.getHours())}:${twoDigit(date.getMinutes())}`;
        } else if (msAgo < (60 * 60 * 24 * 5 * 1000)) {
            this.dateTimePretty = weekday.short[date.getDay()];
        } else {
            this.dateTimePretty = `${twoDigit(date.getDate())}.${twoDigit(date.getMonth() + 1)}`;
        }
    }
}

export default Message;
