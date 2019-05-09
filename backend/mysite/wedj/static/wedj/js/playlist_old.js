function startWs(playlistId) {
    ws = new WebSocket(
        'ws://' + window.location.host +
        '/ws/playlist/' + playlistId + '/');
    ws.onmessage = function (e) {
        var data = JSON.parse(e.data);
        var message = data['message'];
        var link = data['link'];
        var order = data['order'];
        document.querySelector('#chat-log').value += (message + " " + link + " " + order + '\n');
    };
    ws.onclose = function () {
        console.log('Chat socket closed unexpectedly');
        //setTimeout(function () { startWs(playlistId) }, 1000);
    };

    ws.onerror = function (error) {
        console.log(error);
    };
}

document.querySelector('#chat-message-input').focus();
document.querySelector('#chat-message-input').onkeyup = function (e) {
    if (e.keyCode === 13) {  // enter, return
        document.querySelector('#chat-message-submit').click();
    }
};

document.querySelector('#chat-message-submit').onclick = function (e) {
    var messageInputDom = document.querySelector('#chat-message-input');
    var linkInputDom = document.querySelector('#chat-message-input2');
    var linkInputDom2 = document.querySelector('#chat-message-input3');

    var message = messageInputDom.value;
    var link = linkInputDom.value;
    var order = linkInputDom2.value;
    ws.send(JSON.stringify({
        'message': message,
        'link' : link,
        'order' : order,
    }));

    messageInputDom.value = '';
};