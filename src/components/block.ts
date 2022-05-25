export default abstract class Block {
    protected _parent: HTMLElement;

    protected _element: HTMLElement;

    protected _props: Record<string, any>;

    constructor(parent: HTMLElement = document.body, props: Record<string, any> = {}) {
        this._element = this.render();
        this._parent = parent;
        this._props = props;
    }

    // eslint-disable-next-line class-methods-use-this
    private render(): HTMLElement {
        const div = document.createElement('div');
        return div;
    }

    public place() {
        this._parent.append(this._element);
    }

    public show() {
        this._element.style.display = '';
    }

    public hide() {
        this._element.style.display = 'none';
    }
}
