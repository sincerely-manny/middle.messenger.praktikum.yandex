import { TemplateBike } from "../modules/templatebike";

export async function renderModalForm(TE: TemplateBike) {
    let modalWindow;
    let form;
    let collection = await TE.render('modal/window');
    modalWindow = <Element> collection.childNodes[0];
    await TE.render('modal/header', modalWindow);
    let signFormCollection = await TE.render('forms/sign_form');
    form = <Element> signFormCollection.childNodes[0];
    modalWindow.append(form);
    await TE.render('forms/text_inputs_placeholder');
    TE.prependTo(form);
    let container = document.getElementById('container');
    if(container === null) {
        container = document.createElement('main'); 
        container.id= 'container';
        document.body.append(container);
    }
    container.append(modalWindow);
}
