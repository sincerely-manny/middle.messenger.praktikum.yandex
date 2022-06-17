import { TE } from '../modules/templatebike';
import { Form } from './form';
import { InputData } from './input';

export type ProfileFormData = {
    action: string,
    class?: string,
    id?: string,
    submit?: string,
    onSubmit?: EventListener,
    fields: InputData[],
};

export class ProfileForm extends Form {
    constructor(data: ProfileFormData) {
        super(data as ProfileFormData);
    }

    public render() {
        const form = document.createElement('form');
        if (this._props.id) form.id = this._props.id;
        if (this._props.class) form.className = this._props.class;
        form.action = this._props.action;
        this._props.fields.forEach((i: InputData) => {
            TE.appendTo(form, this.createInput(i));
        });
        const submit = Object.assign(document.createElement('input'), {
            type: 'submit',
        });
        if (this._props.submit) {
            submit.value = this._props.submit;
        } else {
            submit.hidden = true;
        }
        form.append(submit as HTMLElement);
        this.submitBtn = submit;

        this.form = form as HTMLFormElement;
        form.addEventListener('submit', this._props.onSubmit);
        return this.form;
    }
}

export default { ProfileForm };
