from .models import Playlist, User, PlaylistElement
from rest_framework import serializers
from django.contrib.auth import get_user_model

UserModel = get_user_model()


class PlaylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Playlist
        fields = ('owner', 'public_editable', 'public_visible', 'type')


class PlaylistElementSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaylistElement
        fields = ('playlist', 'data', 'order')


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        user = UserModel.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

    class Meta:
        model = User
        fields = ('username', 'password', 'email')
