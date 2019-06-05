from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json


class PlaylistConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['playlist_link_id']
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        pass

    def update(self, event):
        self.send(text_data=json.dumps({
            'message': event['message'],
        }))
