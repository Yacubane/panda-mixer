function startWs(playlistId) {
    ws = new WebSocket(
        'ws://' + window.location.host +
        '/ws/playlist/' + playlistId + '/');
    ws.onmessage = function (e) {
        var data = JSON.parse(e.data);
        var message = data['message'];
        var link = data['link'];
        var order = data['order'];

        if(message == 'add') {
            $('#playlist-list').append('\
            <li class="list-group-item d-flex justify-content-between align-items-center" id="item'+data['pk']+'">\
                '+link+ ' ' + order + ' ' + data['pk'] +'\
                <button class="btn btn-md btn-default pull-right" type="button" onclick="trash(this)">\
                <span class="fas fa-trash"></span></button>\
            </li>');
        } else if(message == 'remove') {
            remove(data['pk']);
        }
    };
    ws.onclose = function () {
        console.log('Chat socket closed unexpectedly');
        //setTimeout(function () { startWs(playlistId) }, 1000);
    };

    ws.onerror = function (error) {
        console.log(error);
    };
}
function trash(obj) {
    var parent = obj.parentNode.parentNode;
    var index = Array.prototype.indexOf.call(parent.children, obj.parentNode);
    console.log(index);

    ws.send(JSON.stringify({
        'message': 'remove',
        'order' : index,
    }));
}
function remove(pk) {
    var list = document.getElementById("item"+pk);
    list.remove();
}

function add_link() {
    $('#exampleModal').modal('hide');
    ws.send(JSON.stringify({
        'message': 'add',
        'link' : document.getElementById("message-text").value,
    }));
}