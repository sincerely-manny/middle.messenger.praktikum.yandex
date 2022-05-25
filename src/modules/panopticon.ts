// заготовка для наблюдателя

type ElemState = {
    placed: boolean,
    html: HTMLElement,
    module?: string,
};

type DomState = {
    areas: {
        leftcol: ElemState,
        rightcol: ElemState,
        container: ElemState,
        modal: ElemState,
    }
    modules: {
        chatsList: ElemState,
        searchForm: ElemState,
        activeChat: ElemState,
        noChat: ElemState,
        newMessage: ElemState,
        profile: ElemState,
    }
};

class Panopticon {
    private static instance: Panopticon;

    public domState: DomState;

    private constructor() {
        this.domState = {} as DomState;
    }

    public static getInstance(): Panopticon {
        if (!Panopticon.instance) {
            Panopticon.instance = new Panopticon();
        }

        return Panopticon.instance;
    }
}
