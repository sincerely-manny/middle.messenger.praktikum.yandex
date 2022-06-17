import { InputField, InputData } from './input';

export abstract class Form {
    protected _props: any;

    public form?: HTMLFormElement;

    public inputs?: InputField[] = [];

    public submitBtn?: HTMLInputElement;

    constructor(data: {}) {
        this._props = data;
    }

    public render() {

    }

    protected createInput(data: InputData) {
        const input = new InputField(data);
        const rendered = input.render();
        this.inputs?.push(input);
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

    private compare(oldV: any, newV: any) {
        return Object.keys(oldV).every(
            (key) => (
                typeof oldV[key] === 'object'
                || oldV[key] === newV[key]
            ),
        );
    }

    public logObject() {
        this.inputs?.forEach((i) => {
            i.validate();
        });
    }
}

export default { Form };
