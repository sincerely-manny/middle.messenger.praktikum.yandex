export default abstract class Block {
    protected _element: HTMLElement;

    protected _props: Record<string, any>;

    protected _isPlaced: boolean = false;

    protected _isRendered?: Promise<HTMLElement[]>;

    constructor(props: Record<string, any> = {}) {
        this._props = props;
        this._element = this.render();
    }

    get element() {
        return this._element;
    }

    get isPlaced() {
        return this._isPlaced;
    }

    get isRendered() {
        return this._isRendered;
    }

    protected render(id?: string): HTMLElement {
        if (this._element) {
            this._element.innerHTML = '';
            return this._element;
        }
        const div = document.createElement('div');
        if (id) {
            div.id = id;
        }
        return div;
    }

    public async place(parent: HTMLElement) {
        if (this._isRendered instanceof Promise) {
            await this._isRendered;
        }
        if (!this._isPlaced) {
            this.moveChildren(this._element, parent);
            this._element = parent;
            this._isPlaced = true;
        }
        return this._element;
    }

    public unload() {
        const tempDiv = document.createElement('div');
        if (this._element) this.moveChildren(this._element, tempDiv);
        this._element = tempDiv;
        this._isPlaced = false;
        return tempDiv;
    }

    protected childById(id: string, parent: HTMLElement = document.body): HTMLElement {
        let elem = parent.querySelector(`#${id}`);
        if (!elem) {
            elem = document.createElement('div');
            elem.id = id;
            parent.append(elem);
        }
        return elem as HTMLElement;
    }

    protected moveChildren(from: HTMLElement, to: HTMLElement) {
        while (from.childNodes.length > 0 && from !== to) {
            to.append(from.childNodes[0]);
        }
    }
}
