import { View } from '../components/view';

type Route = {
    controller: View,
    params?: string[],
};

export class Router {
    private static instance: Router;

    private routes!: Record<string, Route>;

    private activeController?: View;

    private _root: keyof typeof this.routes = '';

    public default?: string;

    public e404?: string;

    constructor() {
        if (Router.instance) {
            return Router.instance;
        }
        this.routes = {};
        window.onpopstate = () => {
            this.run(window.location.pathname);
        };
        Router.instance = this;
    }

    public start() {
        this.run(window.location.pathname);
    }

    public go(path: keyof typeof this.routes) {
        window.history.pushState({}, '', `/${path}`);
        const popStateEvent = new PopStateEvent('popstate', {});
        dispatchEvent(popStateEvent);
    }

    public addRoute(root: string, controller: View, params?: string[]) {
        this.routes[root] = ({ controller, params });
        return this;
    }

    private parsePath(path: string) {
        const pathArr = path.split('/');
        if (pathArr[1] === '') {
            if (this.default) {
                pathArr[1] = this.default;
            } else {
                throw new Error('No default controller specified');
            }
        }
        return {
            root: pathArr[1],
            params: pathArr.slice(2),
        };
    }

    private run(path:string) {
        const { root, params } = this.parsePath(path);
        this._root = root;
        let route: Route;
        if (this.routes[root]) {
            route = this.routes[root];
        } else if (this.e404 && this.routes[this.e404]) {
            route = this.routes[this.e404];
        } else {
            throw new Error(`No controller specified for this path: ${path}`);
        }
        const pathParams: Record<string, string> = {};
        route.params?.forEach((p, i) => {
            pathParams[p] = params[i];
        });
        this.activeController?.stop();
        this.activeController = route.controller;
        route.controller.start(pathParams);
    }

    public get root() {
        return this._root;
    }

    public back() {
        window.history.back();
    }

    public forward() {
        window.history.forward();
    }
}

export const RTR = new Router();

export default { Router, RTR };
