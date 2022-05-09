/**
 * @File   : templatebike.js
 * @Author :  ()
 * @Link   :
 * @Date   : 4/17/2022, 4:53:24 PM
 */

/**
 * {{$var}} => value
 * {{$arr}} {{$var}} {{/$arr}} => foreach
 *
 * let TE = new TemplateBike(data, path/to/templates);
 * TE.render(templateName, targetElem);
 */

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

export default class TemplateBike {
    protected readonly regexp: {
        temptateExpression: RegExp;
        variable: RegExp;
        each: (marker: any) => RegExp;
    };

    protected readonly pathToTemplates: string;

    protected templates: Promise<object>;

    protected renderedCollection: Element;

    private _data: { [key: string]: any };

    constructor(data = {}, pathToTemplates = '/src/pages') {
        this.templates = import('../../src/pages/*/*.tbt'); // typescript ругается, но как по-другому запихать в parcel пачку шаблонов? 🤷‍♂️
        this._data = data;
        this.pathToTemplates = pathToTemplates;
        this.regexp = {
            temptateExpression: /\{\{(.*?)\}\}/gi,
            variable: /\$([a-zA-Z_][a-zA-Z_0-9.]*)/gi,
            each(marker) { return new RegExp(`{{\\$${marker}}}([^]*){{/\\$${marker}}}`, 'gi'); },
        };
        this.renderedCollection = document.createElement('div');
    }

    public setData(key: string, value: any) {
        this._data[key] = value;
        return this._data;
    }

    public get data():typeof this._data {
        return this._data;
    }

    private renderNode(node: Element, dataset: Array<object> | boolean = false): Element {
        if (node.hasChildNodes()) {
            node.childNodes.forEach((child) => {
                const childElement = <Element> child;
                if (child.nodeType === TEXT_NODE) { // если текстовая нода – парсим текст
                    childElement.textContent = this.renderExpressionString(
                        child.textContent,
                        childElement,
                        dataset,
                    );
                } else if (child.nodeType === ELEMENT_NODE) { // если элемент - идем глубже
                    this.renderNode(childElement, dataset);
                    if (childElement.hasAttributes()) { // и парсим значения атрибутов
                        const { attributes } = childElement;
                        for (let i = 0; i < attributes.length; i++) {
                            childElement.setAttribute(
                                attributes[i].name,
                                this.renderExpressionString(
                                    attributes[i].value,
                                    childElement,
                                    dataset,
                                ),
                            );
                        }
                    }
                }
            });
        }
        return node;
    }

    private renderExpressionString(
        string: string | null,
        currentNode:Element = document.body,
        dataset: Array<object> | boolean = false,
    ): string {
        if (string === null) return '';
        let hasTemplateExpression = this.regexp.temptateExpression.test(string);
        let renderedString = string;
        while (hasTemplateExpression) {
            renderedString = renderedString.replace(this.regexp.temptateExpression, (m, found) => {
                const renderedVariable: string = found.replace(
                    this.regexp.variable,
                    (match: string, foundVariableName: string) => {
                        const varValue = this.getVariable(foundVariableName, dataset);
                        // если возвращается массив - пробуем искать закрывающий тег
                        if (Array.isArray(varValue)) {
                            return this.renderArray(foundVariableName, varValue, currentNode);
                        }
                        return varValue ?? match; // нет, не массив
                    },
                );
                return renderedVariable;
            });
            hasTemplateExpression = this.regexp.temptateExpression.test(renderedString);
        }
        return renderedString;
    }

    private renderArray(foundVariableName: string, varValue: Array<object>, currentNode: Element) {
        const node = <Element> currentNode;
        if (
            node.parentElement !== null
            && this.regexp.each(foundVariableName).test(node.parentElement.innerHTML)
        ) {
            node.parentElement.innerHTML = node.parentElement.innerHTML.replace(
                this.regexp.each(foundVariableName),
                (match, found) => {
                    let eachNode = '';
                    varValue.forEach((elem: Array<object>) => {
                        const newNode = document.createElement('div');
                        newNode.innerHTML = found;
                        eachNode += this.renderNode(newNode, elem).innerHTML;
                    });
                    return eachNode;
                },
            );
        }
        // есть массив, но нет закрывающего тега в родительской ноде:
        return JSON.stringify(varValue);
    }

    private getVariable(variableName: string, dataset: Object = {}, defaultValue: string = ''): string | Array<object> {
        let value: any;
        // если не передан контекст поиска (или передан пустой):
        if (Object.keys(dataset).length === 0) value = this._data;
        else value = dataset; // контекст передан
        const path = variableName.split('.');
        path.forEach((key) => { value = value[key]; });
        if (value === undefined) {
            // переменная не найдена в контексте - ищем во всем объекте:
            if (Object.keys(dataset).length !== 0) {
                return this.getVariable(variableName);
            }
            return defaultValue;
        }
        if (Array.isArray(value)) return value;
        return value.toString() ?? defaultValue;
    }

    private async fetchTemplate(templateName: string) {
        const templatePath = templateName.split('/');
        let template: any = await this.templates;
        for (let i = 0; i < templatePath.length; i++) {
            template = await template[templatePath[i]];
        }
        template = await template();
        return template.default;
    }

    public async render(templateName: string, targetElem: Element | null = null) {
        const template = await this.fetchTemplate(templateName);
        const element = document.createElement('div');
        element.innerHTML = template;
        this.renderedCollection = <Element> this.renderNode(element);
        if (targetElem != null) {
            this.appendTo(targetElem);
        }
        return this.renderedCollection;
    }

    public appendTo(targetElem: Element): Element {
        if (targetElem !== null) {
            while (this.renderedCollection.childNodes.length > 0) {
                targetElem.append(this.renderedCollection.childNodes[0]);
            }
        }
        return targetElem;
    }

    public prependTo(targetElem: Element): Element {
        if (targetElem !== null) {
            while (this.renderedCollection.childNodes.length > 0) {
                targetElem.prepend(
                    this.renderedCollection
                        .childNodes[this.renderedCollection.childNodes.length - 1],
                );
            }
        }
        return targetElem;
    }
}
