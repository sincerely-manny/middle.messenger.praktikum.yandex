import TemplateBike from '../modules/templatebike';

export async function renderMessages(data: TemplateBike['data']) {
    let sender = '';
    let currShownDate: string | undefined;

    // eslint-disable-next-line no-restricted-syntax
    for (const message of data.active_chat.messages) {
        const mDate = new Date(message.timestamp * 1000);
        let newDate = false;
        const messageToRender = {
            ...message,
            date: mDate.toLocaleDateString(),
            time: mDate.toLocaleTimeString('ru-RU').slice(0, -3),
        };
        const MsgTE = new TemplateBike(messageToRender);
        if (currShownDate !== message.date) {
            currShownDate = message.date;
            newDate = true;
            await MsgTE.render('messages/date', document.getElementById('active_chat_messages'));
        }
        if (sender !== message.sender.id || newDate) {
            sender = message.sender.id;
            await MsgTE.render('messages/sender', document.getElementById('active_chat_messages'));
        }
        if (message.img_attachment !== undefined) {
            await MsgTE.render('messages/message_img', document.getElementById('active_chat_messages'));
        } else {
            await MsgTE.render('messages/message', document.getElementById('active_chat_messages'));
        }
    }
    const chatCont = document.getElementById('active_chat_messages_container');
    if (chatCont != null) {
        chatCont.scrollTo(0, chatCont.scrollHeight);
    }
}

export default renderMessages;
