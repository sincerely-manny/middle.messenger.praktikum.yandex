import { expect } from 'chai';
import { TE } from './templatebike';

describe('Проверяем Шаблонизатор', () => {
    it('Импортирует шаблоны', async () => {
        const a = TE.render('test/string');
        expect(await a).to.be.an('array');
    });
    it('Корректно подставляет значения в переменные', async () => {
        const data = {
            str: 'str',
        };
        const outputStr = TE.render('test/string', null, data);
        expect((await outputStr)[0].innerHTML).to.eq('str');
    });
    it('Удаляет переменные, значения которых не найдены', async () => {
        const outputStr = TE.render('test/string');
        expect((await outputStr)[0].innerHTML).to.eq('');
    });
    it('Корректно обрабатывает циклы', async () => {
        const data = {
            arr: [
                { str: 'str1' },
                { str: 'str2' },
            ],
        };
        const outputStr = TE.render('test/cycle', null, data);
        expect((await outputStr)[0].outerHTML).to.eq('<ul><li>str1</li><li>str2</li></ul>');
    });
    it('Append и prepend вставляют блоки в нужном порядке', async () => {
        const data1 = {
            str: 'str1',
        };
        const data2 = {
            str: 'str2',
        };
        const outputStr1 = await TE.render('test/string', null, data1);
        const outputStr2 = await TE.render('test/string', null, data2);
        const main = document.createElement('main');
        TE.appendTo(main, outputStr1);
        TE.prependTo(main, outputStr2);
        expect(main.innerHTML).to.eq('<div>str2</div><div>str1</div>');
    });
});
