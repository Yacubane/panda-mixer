from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .models import Playlist, PlaylistElement
from django.db.models import Max
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

        playlist = Playlist.objects.get(link_id=self.room_name)
        playlist_elements = PlaylistElement.objects.filter(playlist=playlist)

        for elem in playlist_elements:
            async_to_sync(self.channel_layer.send)(
                self.channel_name,
                {
                    'type': 'add_playlist_element',
                    'message': 'add',
                    'link': elem.link,
                    'order' : elem.order,
                    'pk': elem.pk,
                }
            )
        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        playlist = Playlist.objects.get(link_id=self.room_name)

        if message.startswith("add"):
            next_order = PlaylistElement.objects.filter(
                playlist=playlist).aggregate(Max('order'))['order__max']
            if next_order == None:
                next_order = -1

            playlist_element = PlaylistElement.objects.create(
                playlist=playlist,
                link=text_data_json['link'],
                order=next_order+1)

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'add_playlist_element',
                    'message': 'add',
                    'link': text_data_json['link'],
                    'pk': playlist_element.pk,
                    'order':next_order+1,
                }
            )
        elif message.startswith("remove"):
            order = text_data_json['order']
            try:
                playlist_element = PlaylistElement.objects.get(
                    playlist=playlist, order=order)
                playlist_element_pk = playlist_element.pk
                playlist_element.delete()

                for elem in PlaylistElement.objects.filter(playlist=playlist):
                    if(elem.order > order):
                        elem.order = elem.order-1
                        elem.save()
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'remove_playlist_element',
                        'message': 'remove',
                        'order': order,
                        'pk': playlist_element_pk,
                    }
                )

            except PlaylistElement.DoesNotExist:
                pass

    def add_playlist_element(self, event):
        self.send(text_data=json.dumps({
            'message': event['message'],
            'link': event['link'],
            'order': event['order'],
            'pk': event['pk'],
        }))

    def remove_playlist_element(self, event):
        self.send(text_data=json.dumps({
            'message': event['message'],
            'order': event['order'],
            'pk': event['pk'],
        }))
