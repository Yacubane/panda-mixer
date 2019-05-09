function startWs(playlistId) {
    ws = new WebSocket(
        'ws://' + window.location.host +
        '/ws/playlist/' + playlistId + '/');
    ws.onmessage = function (e) {
        var data = JSON.parse(e.data);
        var message = data['message'];
        var link = data['link'];
        var order = data['order'];
        console.log(message, data['pk']);
        if (message == 'add') {
            $('#playlist-list').append('\
            <li class="list-group-item d-flex justify-content-between align-items-center" id="item'+ data['pk'] + '">\
                '+ link + ' ' + order + ' ' + data['pk'] + '\
                <button class="btn btn-md btn-default pull-right" type="button" onclick="trash(this)">\
                <span class="fas fa-trash"></span></button>\
            </li>');
        } else if (message == 'remove') {
            remove(data['pk']);
        }
    };
    ws.onclose = function () {
        console.log('Chat socket closed unexpectedly');
        setTimeout(function () { startWs(playlistId) }, 1000);
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
        'order': index,
    }));
}
function remove(pk) {
    var list = document.getElementById("item" + pk);
    list.remove();
}
function add_link_from(link) {
    $('#exampleModal').modal('hide');
    ws.send(JSON.stringify({
        'message': 'add',
        'link': link,
    }));
}

function add_link() {
    add_link(document.getElementById("message-text").value);
}

let search_box_changed = false;
let search_box_updated = true;

const search_box = document.querySelector('#youtube-search-box');

const typeHandler = function (e) {
    console.log(e.target.value);
    search_box_changed = true;
}

search_box.addEventListener('input', typeHandler);

const search_box_refresh_interval = setInterval(function () {
    if (search_box_changed && search_box_updated) {
        query_youtube(search_box.value)
        search_box_changed = false;
        search_box_updated = false;
    }
}, 1000);

function query_youtube(query) {
    console.log(window.location.host + '/api/ytquery/' + query + '/');
    $.ajax('http://' + window.location.host + '/api/ytquery/' + query + '/',
        {
            dataType: 'json',
            timeout: 2000,
            success: function (data, status, xhr) {
                $('#youtube-query-list').empty()
                search_box_updated = true;
                if (data.hasOwnProperty('items')) {
                    var i;
                    for (i = 0; i < data['items'].length; i++) {
                        let item = data['items'][i];
                        let id = item['id']['videoId'];
                        let thumbnail = item['snippet']['thumbnails']['medium']['url'];
                        let title = item['snippet']['title'];
                        let description = item['snippet']['description'];
                        add_youtube_query_element(id, thumbnail, title, description);
                    }
                } else {
                    //todo: handle error
                }
            },
            error: function (jqXhr, textStatus, errorMessage) {
                search_box_updated = true;
                console.log(errorMessage);
            }
        });
}

function add_youtube_query_element(id, thumbnail, title, description) {
    $('#youtube-query-list').append('\
        <li class="mb-4 justify-content-between align-items-center">\
        <div class="card flex-row flex-wrap">\
            <div style="flex: 0 0 30%;">\
                <div style="display: flex;align-items: center;height: 100%;">\
                    <img src="'+ thumbnail + '" alt="" width="100%">\
                </div>\
            </div>\
            <div class="card-block p-3" style="flex: 0 0 70%; overflow:hidden;">\
                <div style="width:100%; height:100%; display: flex; flex-direction: column;">\
                    <h5 class="card-title youtube-query-item-title">'+ title + '</h5>\
                    <div style="margin-top: auto">\
                        <a href="#" class="btn btn-primary mr-2">Play</a>\
                        <a href="#" class="btn btn-primary" onclick="add_link_from(\''+ id + '\')">Add</a>\
                    </div>\
                </div>\
            </div>\
        <div class="w-100"></div>\
        </div>\
        </li>\
    ');
}