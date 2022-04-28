export async function renderModalForm(TE) {
    let modalWindow;
    let form;
    let collection = await TE.render('modal/window');
    modalWindow = collection.childNodes[0];
    await TE.render('modal/header', modalWindow);
    let signFormCollection = await TE.render('forms/sign_form');
    form = signFormCollection.childNodes[0];
    modalWindow.append(form);
    await TE.render('forms/text_inputs_placeholder');
    TE.prependTo(form);
    document.getElementById('container').append(modalWindow);
}
