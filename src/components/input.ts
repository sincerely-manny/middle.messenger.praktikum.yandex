const rules = {
    password: /(?=(.*[0-9]))((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.{8,40}$/,
    email: /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/,
    username: /^(?=.*[a-z])[a-z0-9_-]{3,20}$/i,
    phone: /^(([+][(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))\s*[)]?[-\s.]?[(]?[0-9]{1,3}[)]?([-\s.]?[0-9]{3})([-\s.]?[0-9]{3,4})$/,
    name: /^[A-ZА-Я]+[a-zа-я-]*$/,
    displayname: /^[a-zа-я0-9_-\s]{1,20}$/i,
    message: /\S/,
};

export type InputData = {
    type: 'text' | 'password',
    value?: string,
    placeholder: string,
    name: string,
    class?: string,
    onFocus?: EventListener,
    onBlur?: EventListener,
    label?: {
        class?: string,
        value_before?: string,
        value_after?: string,
    },
    validate?: keyof typeof rules,
};

export class InputField {
    protected _props: InputData;

    public html?: HTMLInputElement;

    constructor(data: InputData) {
        this._props = data;
    }

    public render(): HTMLElement[] {
        const form: HTMLElement[] = [];
        const input = document.createElement('input');
        const rnd = Math.floor(Math.random() * 1000);
        input.type = this._props.type;
        input.name = this._props.name;
        if (this._props.value) input.value = this._props.value;
        if (this._props.placeholder) input.placeholder = this._props.placeholder;
        if (this._props.class) input.className = this._props.class;
        input.id = `${this._props.name}_input-${rnd}`;
        if (this._props.label?.value_before) {
            const label = Object.assign(document.createElement('label'), {
                className: this._props.label.class ? this._props.label.class : 'label-before',
                htmlFor: `${this._props.name}_input-${rnd}`,
                textContent: this._props.label.value_before,
            });
            form.push(label as HTMLElement);
        }
        form.push(input);
        if (this._props.label?.value_after) {
            const label = Object.assign(document.createElement('label'), {
                className: this._props.label.class ? this._props.label.class : 'label-after',
                htmlFor: `${this._props.name}_input-${rnd}`,
                textContent: this._props.label.value_after,
            });
            form.push(label as HTMLElement);
        }
        this.html = input;
        if (this._props.validate) {
            ['focus', 'blur', 'keyup'].forEach((ev) => {
                input.addEventListener(ev, () => {
                    this.validate(input, this._props.validate);
                });
            });
        }
        return form;
    }

    // eslint-disable-next-line class-methods-use-this
    private validate(input: HTMLInputElement, rule: keyof typeof rules | undefined = 'message'): boolean {
        const isValid = rules[rule].test(input.value);
        if (isValid) {
            input.classList.add('valid');
            input.classList.remove('invalid');
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
        }
        return isValid;
    }
}

export default { InputField };
