import { ErrorPage, errors } from '../blocks/error';
import { View } from '../components/view';

export default class E404 extends View {
    private static instance: E404;

    private err?: ErrorPage;

    constructor() {
        super();
        if (E404.instance) {
            return E404.instance;
        }
        E404.instance = this;
    }

    public start(_params?: Record<string, string> | undefined): void {
        if (!this.err) {
            this.err = new ErrorPage(errors.e404);
        }
        this.err.place(this.childById('conainer'));
    }

    public stop(): void {
        this.err?.unload();
    }
}
