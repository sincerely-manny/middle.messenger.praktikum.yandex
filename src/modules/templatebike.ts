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

export class TemplateBike {
    protected readonly regexp: { temptateExpression: RegExp; variable: RegExp; each: (marker: any) => RegExp; };
    protected readonly pathToTemplates: string;
    protected templates: Promise<object>;
    protected renderedCollection: Element;
    public data: { [key: string]: any };
    constructor(data = {}, pathToTemplates = '/src/pages') {
        this.templates = import('../../src/pages/*/*.tbt'); // typescript ругается, но как по-другому запихать в parcel пачку шаблонов? 🤷‍♂️
        this.data = data;
        this.pathToTemplates = pathToTemplates;
        this.regexp = {
            temptateExpression: /\{\{(.*?)\}\}/gi,
            variable: /\$([a-zA-Z_][a-zA-Z_0-9\.]*)/gi,
            each: function(marker) {return new RegExp(`\{\{\\$${marker}\}\}([^]*)\{\{/\\$${marker}\}\}`, 'gi')},
        }
        this.renderedCollection = document.createElement('div');
    }
    
    private renderNode(node: Element, dataset: Array<object> | boolean = false): Element{
        if(node.hasChildNodes()) {      
            for(let child of node.childNodes) {
                let childElement = <Element> child;
                if(child.nodeType === TEXT_NODE) {  //если текстовая нода – парсим текст
                    child.textContent = this.renderExpressionString(child.textContent, childElement, dataset);
                }
                else if(child.nodeType === ELEMENT_NODE) { //если элемент - идем глубже
                    this.renderNode(childElement, dataset);
                    if(childElement.hasAttributes()) { //и парсим значения атрибутов
                        let attributes = childElement.attributes;
                        for (var i = 0; i < attributes.length; i++) {
                            childElement.setAttribute(
                                attributes[i].name, 
                                this.renderExpressionString(attributes[i].value, childElement, dataset)
                            );
                        }
                    }
                }
            };
        }
        return node;
    }

    private renderExpressionString(string: string | null, currentNode:Element = document.body, dataset: Array<object> | boolean = false): string {
        if(string === null) return '';
        let hasTemplateExpression = this.regexp.temptateExpression.test(string);
        while(hasTemplateExpression) {
            string = string.replace(this.regexp.temptateExpression, (match, found) => {
                let renderedVariable: string = found.replace(this.regexp.variable, (match: string, foundVariableName: string) => {
                    let varValue = this.getVariable(foundVariableName, dataset);
                    if (Array.isArray(varValue)) { //если возвращается массив - пробуем искать закрывающий тег
                        return this.renderArray(foundVariableName, varValue, currentNode);
                    }
                    else {
                        return varValue ?? match; //нет, не массив
                    }
                });
                return renderedVariable;
            });
            hasTemplateExpression = this.regexp.temptateExpression.test(string);
        }
        return string;
    }

    private renderArray(foundVariableName: string, varValue: Array<object>, currentNode: Element) {
        if(currentNode.parentElement !== null && this.regexp.each(foundVariableName).test(currentNode.parentElement.innerHTML)) {
            currentNode.parentElement.innerHTML = currentNode.parentElement.innerHTML.replace(
                this.regexp.each(foundVariableName), 
                (match, found) => {
                    let eachNode = '';
                    varValue.forEach((elem: Array<object>) => {
                        let node = document.createElement('div');
                        node.innerHTML = found;
                        eachNode += this.renderNode(node, elem).innerHTML;
                    });
                    return eachNode;
                });
        }
        else {
            return JSON.stringify(varValue); //есть массив, но нет закрывающего тега в родительской ноде
        }
    }

    private getVariable(variableName: string, dataset: Object = {}, defaultValue: string = ''): string | Array<object> {
        let value: any;
        if(Object.keys(dataset).length === 0) value =  this.data; //если не передан контекст поиска (или передан пустой)
        else value = dataset; //контекст передан
        let path = variableName.split('.');
        for(let key of path) {
            value = value[key];
            if(value === undefined) {
                if(Object.keys(dataset).length !== 0) return this.getVariable(variableName); //переменная не найдена в контексте - ищем во всем объекте
                return defaultValue;
            }
        }
        if (Array.isArray(value)) return value;
        return value.toString() ?? defaultValue;
    }

    private async fetchTemplate(templateName: string) {
        let templatePath = templateName.split('/');
        let template: any = await this.templates;
        for(let i = 0; i < templatePath.length; i++) {
            template = await template[templatePath[i]];
        }
        template = await template();
        return template.default;
    }
    
    public async render(templateName: string, targetElem: Element | null = null) {
        let template = await this.fetchTemplate(templateName);
        let element = document.createElement('div');
        element.innerHTML = template;
        this.renderedCollection = <Element> this.renderNode(element);
        if(targetElem != null) {
            this.appendTo(targetElem);
        }
        return this.renderedCollection;
    }
    
    public appendTo(targetElem: Element): Element {
        if(targetElem !== null) {
            while(this.renderedCollection.childNodes.length > 0) {
                targetElem.append(this.renderedCollection.childNodes[0]);
            }
        }
        return targetElem;
    }

    public prependTo(targetElem: Element): Element {
        if(targetElem !== null) {
            while(this.renderedCollection.childNodes.length > 0) {
                targetElem.prepend(this.renderedCollection.childNodes[this.renderedCollection.childNodes.length - 1]);
            }
        }
        return targetElem;
    }
}
