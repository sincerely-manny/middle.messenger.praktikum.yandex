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

export class TemplateBike {
    constructor(data = {}, pathToTemplates = '/src/pages') {
        this.pages = import('../../src/pages/*/*.tbt');
        this.data = data;
        this.pathToTemplates = pathToTemplates;
        this.regexp = {
            temptateExpression: /\{\{(.*?)\}\}/gi,
            variable: /\$([a-zA-Z_][a-zA-Z_0-9\.]*)/gi,
            each: function(marker) {return new RegExp(`\{\{\\$${marker}\}\}([^]*)\{\{/\\$${marker}\}\}`, 'gi')},
        }
        this.renderedCollection = document.createElement('div');

    }
    
    renderNode(node, dataset = false) {
        if(node.hasChildNodes()) {      
            node.childNodes.forEach(child => {
                if(child.nodeType === 3) {  //если текстовая нода – парсим текст
                    child.textContent = this.renderExpressionString(child.textContent, child, dataset);
                }
                else if(child.nodeType === 1) { //если элемент - идем глубже
                    this.renderNode(child, dataset);
                    if(child.hasAttributes()) { //и парсим значения атрибутов
                        let attributes = child.attributes;
                        for (var i = 0; i < attributes.length; i++) {
                            child.setAttribute(
                                attributes[i].name, 
                                this.renderExpressionString(attributes[i].value, child, dataset)
                            );
                        }
                    }
                }
            });
        }
        return node;
    }
    renderExpressionString(string, currentNode = document.body, dataset = false) {
        let hasTemplateExpression = this.regexp.temptateExpression.test(string);
        while(hasTemplateExpression) {
            string = string.replace(this.regexp.temptateExpression, (match, found, offset, expressionString) => {
                let renderedVariable = found.replace(this.regexp.variable, (match, foundVariableName, offset, variableString) => {
                    let varValue = this.getVariable(foundVariableName, dataset);
                    if (Array.isArray(varValue)) { //если возвращается массив - пробуем искать закрывающий тег
                        if(this.regexp.each(foundVariableName).test(currentNode.parentElement.innerHTML)) {
                            currentNode.parentElement.innerHTML = currentNode.parentElement.innerHTML.replace(
                                this.regexp.each(foundVariableName), 
                                (match, found, offset, variableString) => {
                                    let eachNode = '';
                                    varValue.forEach(elem => {
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
                    else return varValue ?? match; //нет, не массив
                });
                return renderedVariable;
            });
            hasTemplateExpression = this.regexp.temptateExpression.test(string);
        }
        return string;
    }
    getVariable(variableName, dataset = false, defaultValue = null) {
        let value;
        if(dataset == false) value =  this.data; //если не передан контекст поиска (или передан пустой)
        else value = dataset; //контекст передан
        let path = variableName.split('.');
        for(let key of path) {
            value = value[key];
            if(value === undefined) {
                if(dataset) return this.getVariable(variableName); //переменная не найдена в контексте - ищем во всем объекте
                return defaultValue;
            }
        }
        if (Array.isArray(value)) return value;
        return value.toString() ?? defaultValue;
    }

    async fetchTemplate(templateName) {
        let templatePath = templateName.split('/');
        let template = await this.pages;
        for(let i = 0; i < templatePath.length; i++) {
            template = await template[templatePath[i]];
        }
        template = await template();
        return template.default;
    }
    
    async render(templateName, targetElem = undefined) {
        let template = await this.fetchTemplate(templateName);
        let element = document.createElement('div');
        element.innerHTML = template;
        this.renderedCollection = this.renderNode(element);
        if(targetElem != undefined) {
            this.appendTo(targetElem);
        }
        return this.renderedCollection;
    }
    
    appendTo(targetElem) {
        if(targetElem !== null) {
            while(this.renderedCollection.childNodes.length > 0) {
                targetElem.append(this.renderedCollection.childNodes[0]);
            }
        }
        return targetElem;
    }
    prependTo(targetElem) {
        if(targetElem !== null) {
            while(this.renderedCollection.childNodes.length > 0) {
                targetElem.prepend(this.renderedCollection.childNodes[this.renderedCollection.childNodes.length - 1]);
            }
        }
        return targetElem;
    }
}
