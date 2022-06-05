export abstract class View {
    public start(_params?:Record<string, string>) {

    }

    public stop() {

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
}

export default { View };
