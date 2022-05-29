import { TE } from '../modules/templatebike';
import { Form } from './form';
import { InputData } from './input';

export type ModalFormData = {
    header: string,
    message: string,
    link: {
        text: string,
        href: string,
        onclick: EventListener,
    },
    fields: InputData[],
    onSubmit: EventListener,
};

export class ModalForm extends Form {
    private html?: HTMLElement;

    constructor(data: ModalFormData) {
        super(data as ModalFormData);
    }

    public async render() {
        let modalWindow;
        if (this.html) {
            modalWindow = this.html;
            modalWindow.innerHTML = '';
        } else {
            [modalWindow] = await TE.render('modal/window');
            this.html = modalWindow;
        }
        await TE.render('modal/header', modalWindow, this._props);
        const [form] = await TE.render('forms/sign_form', modalWindow, this._props);
        this.form = form as HTMLFormElement;
        form.querySelector('a')?.addEventListener('click', this._props.link.onclick);
        form.addEventListener('submit', this._props.onSubmit);
        let inputs: HTMLElement[] = [];
        this._props.fields.forEach((i: InputData) => {
            inputs = inputs.concat(this.createInput(i));
        });
        TE.prependTo(form, inputs);
        return modalWindow;
    }

    public destroy() {
        return this.html?.remove();
    }
}

export default { ModalForm };
