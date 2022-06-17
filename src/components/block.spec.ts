/* eslint-disable max-classes-per-file */
import { expect } from 'chai';
import Block from './block';

class MockBlockSync extends Block {
    public render(): HTMLElement {
        const container = super.render('cont');
        const inner = 'test';
        container.append(inner);
        return container;
    }
}
class MockBlockAsync extends Block {
    public render() {
        const container = document.createElement('div');
        container.id = 'container';
        this._isRendered = this.renderAsync();
        this._isRendered.then((e) => {
            this._element.append(e[0]);
        });
        return container;
    }

    private renderAsync(): Promise<HTMLElement[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([document.createElement('h1')]);
            }, 1);
        });
    }
}

describe('Проверяем Block (компонент)', () => {
    describe('Проверяем блок c синхронным рендером', () => {
        const container = document.createElement('main');
        const blockSync = new MockBlockSync();
        it('Блок c синхронным рендером вставляется в нужный parent', () => {
            blockSync.place(container);
            expect(container.innerHTML).to.be.eq('test');
        });
        it('Блок c синхронным рендером удаляется по .unload()', () => {
            blockSync.unload();
            expect(container.innerHTML).to.be.eq('');
        });
    });
    describe('Проверяем блок c aсинхронным рендером', () => {
        const container = document.createElement('main');
        const blockAsync = new MockBlockAsync();
        it('Блок c aсинхронным рендером вставляется в нужный parent', async () => {
            blockAsync.place(container);
            await blockAsync.isRendered;
            expect(container.innerHTML).to.be.eq('<h1></h1>');
        });
        it('Блок c aсинхронным рендером удаляется по .unload()', () => {
            blockAsync.unload();
            expect(container.innerHTML).to.be.eq('');
        });
    });
});
