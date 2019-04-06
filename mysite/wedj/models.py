from django.db import models


class Playlist(models.Model):
    link_id = models.CharField(max_length=10, unique=True)


class PlaylistElement(models.Model):
    playlist = models.ForeignKey('Playlist', on_delete=models.CASCADE)
    link = models.CharField(max_length=200)
    order = models.IntegerField()
    class Meta:
        unique_together = ('playlist', 'order',)