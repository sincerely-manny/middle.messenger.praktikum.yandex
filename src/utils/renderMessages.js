import { TemplateBike } from "../modules/templatebike";

export async function renderMessages(data) {
    let MsgTE = {};
    let sender = null;
    let currShownDate = null;

    for(let message of data.active_chat.messages) {
        let mDate = new Date(message.timestamp*1000);
        let newDate = false;
        const messageToRender = Object.assign({}, message, {
            date: mDate.toLocaleDateString(),
            time: mDate.toLocaleTimeString('ru-RU').slice(0,-3),
        });
        MsgTE = new TemplateBike(messageToRender);
        if(currShownDate !==  message.date) {
            currShownDate = message.date;
            newDate = true;
            await MsgTE.render('messages/date', document.getElementById('active_chat_messages'));
        }
        if(sender !== message.sender.id || newDate) {
            sender = message.sender.id; 
            await MsgTE.render('messages/sender', document.getElementById('active_chat_messages'));
        }
        if(message.img_attachment != undefined) {
            await MsgTE.render('messages/message_img', document.getElementById('active_chat_messages'));
        }
        else {
            await MsgTE.render('messages/message', document.getElementById('active_chat_messages'));
        }
    }
    let chatCont = document.getElementById('active_chat_messages_container');
    chatCont.scrollTo(0, chatCont.scrollHeight);
};
