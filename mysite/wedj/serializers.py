from .models import Playlist
from rest_framework import serializers


class PlaylistSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Playlist
        fields = ('link_id',)
