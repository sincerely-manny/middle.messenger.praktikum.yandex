export function renderModalForm(TE) {
    let modalWindow;
    let form;
    TE.render('modal/window').then(function(collection) {
        modalWindow = collection.childNodes[0];
        TE.render('modal/header', modalWindow).then(function() {
            TE.render('forms/sign_form').then(function(collection) {
                form = collection.childNodes[0];
                modalWindow.append(form);
                TE.render('forms/text_inputs_placeholder').then(function() {
                    TE.prependTo(form);
                });
            });

        });
        document.getElementById('container').append(modalWindow);
    });
}