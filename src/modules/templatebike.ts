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

import * as importedTemplates from '../utils/importTemplates';

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

export class TemplateBike {
    private static instance: TemplateBike;

    protected readonly regexp!: {
        temptateExpression: RegExp;
        variable: RegExp;
        each: (marker: any) => RegExp;
    };

    protected readonly pathToTemplates!: string;

    protected templates: any;

    protected renderedCollection!: HTMLElement;

    private _data?: { [key: string]: any } = {};

    constructor(data: { [key: string]: any } | undefined = undefined, pathToTemplates = '/src/pages') {
        if (TemplateBike.instance) {
            if (!TemplateBike.instance._data) {
                TemplateBike.instance._data = data;
            }
            return TemplateBike.instance;
        }

        this.templates = importedTemplates.tmpl;
        this._data = data;
        this.pathToTemplates = pathToTemplates;
        this.regexp = {
            temptateExpression: /\{\{(.*?)\}\}/gi,
            variable: /\$([a-zA-Z_][a-zA-Z_0-9.]*)/gi,
            each(marker) { return new RegExp(`{{\\$${marker}}}([^]*){{/\\$${marker}}}`, 'gi'); },
        };
        this.renderedCollection = document.createElement('div');

        TemplateBike.instance = this;
    }

    public get data():typeof this._data {
        return this._data;
    }

    public set data(v) {
        if (!this._data) {
            this._data = v;
        } else {
            throw new Error('access denied');
        }
    }

    private renderNode(node: HTMLElement, dataset: object | boolean = false): HTMLElement {
        if (node.hasChildNodes()) {
            // foreach не подходит: при добавлении отрендеренных нод длина массива меняется
            for (let i = 0; i < node.childNodes.length; i++) {
                const child = node.childNodes[i];
                const childElement = <HTMLElement> child;
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
                        for (let j = 0; j < attributes.length; j++) {
                            childElement.setAttribute(
                                attributes[j].name,
                                this.renderExpressionString(
                                    attributes[j].value,
                                    childElement,
                                    dataset,
                                ),
                            );
                        }
                    }
                }
            }
        }
        return node;
    }

    private renderExpressionString(
        string: string | null,
        currentNode:HTMLElement = document.body,
        dataset: object | boolean = false,
    ): string {
        if (string === null) return '';
        let hasTemplateExpression = this.regexp.temptateExpression.test(string);
        let renderedString = string;
        while (hasTemplateExpression) {
            renderedString = renderedString.replace(this.regexp.temptateExpression, (_m, found) => {
                const renderedVariable: string = found.replace(
                    this.regexp.variable,
                    (match: string, foundVariableName: string) => {
                        const varValue = this.getVariable(foundVariableName, dataset);
                        if (varValue instanceof HTMLElement) {
                            // если htmlelement - пихаем его прямо туда
                            currentNode.before(varValue);
                            return '';
                        }
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

    private renderArray(
        foundVariableName: string,
        varValue: Array<object>,
        currentNode: HTMLElement,
    ) {
        const node = <HTMLElement> currentNode;
        if (
            node.parentElement !== null
            && this.regexp.each(foundVariableName).test(node.parentElement.innerHTML)
        ) {
            node.parentElement.innerHTML = node.parentElement.innerHTML.replace(
                this.regexp.each(foundVariableName),
                (_match, found) => {
                    let eachNode = '';
                    varValue.forEach((elem) => {
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

    private getVariable(
        variableName: string,
        dataset: Object = {},
        defaultValue: string = '',
    ): string | Array<object> | HTMLElement {
        let value: any;
        // если не передан контекст поиска (или передан пустой):
        if (Object.keys(dataset).length === 0) value = this._data;
        else value = dataset; // контекст передан
        const path = variableName.split('.');
        path.forEach((key) => {
            if (value) {
                value = value[key];
            }
            return value;
        });
        if (value === undefined) {
            // переменная не найдена в контексте - ищем во всем объекте:
            if (Object.keys(dataset).length !== 0) {
                return this.getVariable(variableName);
            }
            return defaultValue;
        }
        if (Array.isArray(value) || value instanceof HTMLElement) return value;
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

    public async render(
        templateName: string,
        targetElem: HTMLElement | null = null,
        dataset: object | boolean = false,
    ): Promise<HTMLElement[]> {
        const template = await this.fetchTemplate(templateName);
        const element = document.createElement('div');
        element.innerHTML = template;
        this.renderedCollection = <HTMLElement> this.renderNode(element, dataset);
        const collectionArray = this.collectionToArray(this.renderedCollection);
        if (targetElem != null) {
            this.appendTo(targetElem);
        }
        // return this.renderedCollection;
        return collectionArray;
    }

    private collectionToArray(renderedCollection = this.renderedCollection): HTMLElement[] {
        const renderCollectionArray = [];
        for (let i = 0; i < renderedCollection.childNodes.length; i++) {
            renderCollectionArray.push(renderedCollection.childNodes[i]);
        }
        return renderCollectionArray as HTMLElement[];
    }

    public appendTo(
        targetElem: HTMLElement | null,
        renderedCollection: HTMLElement | HTMLElement[] = this.renderedCollection,
        prepend = false,
    ): HTMLElement | null {
        if (targetElem !== null) {
            // while (renderedCollection.childNodes.length > 0) {
            //     targetElem.append(renderedCollection.childNodes[0]);
            // }
            let colArr = [];
            if (!Array.isArray(renderedCollection)) {
                colArr = this.collectionToArray(renderedCollection);
            } else {
                colArr = renderedCollection;
            }
            if (prepend) {
                colArr.reverse();
            }
            colArr.forEach((e) => {
                // вроде пробелы и переносы нам не очень нужны
                if (!(e.nodeType === TEXT_NODE && (e.textContent === '\n' || e.textContent === ' '))) {
                    if (prepend) {
                        targetElem.prepend(e);
                    } else {
                        targetElem.append(e);
                    }
                }
            });
        }
        return targetElem;
    }

    public prependTo(
        targetElem: HTMLElement | null,
        renderedCollection: HTMLElement | HTMLElement[] = this.renderedCollection,
    ): HTMLElement | null {
        return this.appendTo(targetElem, renderedCollection, true);
    }
}

export const TE = new TemplateBike();

export default { TemplateBike, TE };
