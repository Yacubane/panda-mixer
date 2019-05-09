from django.conf.urls import url
from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path('ws/playlist/<str:playlist_link_id>/', consumers.PlaylistConsumer),
]