from rest_framework.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class User(AbstractUser):
    username = models.CharField('username', max_length=150, unique=True)
    email = models.EmailField('email_address', unique=True)

    USERNAME_FIELD = 'username'
    EMAIL_FIELD = 'email'

    REQUIRED_FIELDS = ['email', ]


def validate_playlist_types(sender, instance, **kwargs):
    valid_types = [t[0] for t in sender.PLAYLIST_TYPES]
    if instance.type not in valid_types:
        raise ValidationError({
            "detail": 'Playlist type is not one of the permitted values: {}'.format(valid_types)
        })


class Playlist(models.Model):
    PLAYLIST_TYPES = (
        ('YT', 'YouTube'),
        # ('SP', 'Spotify'),
    )
    owner = models.ForeignKey(settings.AUTH_USER_MODEL,
                              null=True, on_delete=models.CASCADE)
    public_editable = models.BooleanField(default=True)
    public_visible = models.BooleanField(default=True)
    link_id = models.CharField(max_length=10, unique=True)
    type = models.CharField(max_length=2, choices=PLAYLIST_TYPES)


models.signals.pre_save.connect(validate_playlist_types, sender=Playlist)


class PlaylistElement(models.Model):
    playlist = models.ForeignKey('Playlist', on_delete=models.CASCADE)
    data = models.CharField(max_length=200)
    order = models.IntegerField()
    title = models.CharField(max_length=200, default='404 name not found')

    class Meta:
        unique_together = ('playlist', 'order',)
