import { InputField, InputData } from './input';

export abstract class Form {
    protected _props: any;

    public form?: HTMLFormElement;

    public inputs?: HTMLInputElement[] = [];

    constructor(data: {}) {
        this._props = data;
    }

    // eslint-disable-next-line class-methods-use-this
    public render() {

    }

    protected createInput(data: InputData) {
        const input = new InputField(data);
        const rendered = input.render();
        if (input.html) {
            this.inputs?.push(input.html);
        }
        return rendered;
    }

    public destroy() {
        return this.form?.remove();
    }

    public get props() {
        return this._props;
    }

    public set props(v) {
        if (!this.compare(this._props, v)) {
            this._props = v;
            this.render();
        }
    }

    // eslint-disable-next-line class-methods-use-this
    private compare(oldV: any, newV: any) {
        return Object.keys(oldV).every(
            (key) => (
                typeof oldV[key] === 'object'
                || oldV[key] === newV[key]
            ),
        );
    }

    public logObject() {
        const object: { [key: string]: FormDataEntryValue | null } = {};
        const formData = new FormData(this.form);
        // eslint-disable-next-line no-restricted-syntax
        for (const k of formData.keys()) {
            object[k] = formData.get(k);
        }
        // eslint-disable-next-line no-console
        console.log(object);
        return object;
    }
}

export default { Form };
