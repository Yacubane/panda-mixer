from django.shortcuts import render

from .models import Playlist
from .models import User
from .models import PlaylistElement

from rest_framework import viewsets
from rest_framework.response import Response
from .serializers import PlaylistSerializer
from .serializers import UserSerializer, PlaylistElementSerializer
from .permissions import PlaylistPermission, PlaylistElementsPermission, PlaylistElementPermission
from .permissions import UserDetailPermission

import string
import random

import requests
import json
from django.http import JsonResponse

from rest_framework import permissions
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework import mixins
from rest_framework import status
from django.db.models import Max


def send_channel_message(group_name, message):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'update',
            'message': message,
        }
    )


class UsersView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    model = User
    serializer_class = UserSerializer


class UserDetailsView(generics.RetrieveUpdateAPIView):
    permission_classes = (UserDetailPermission,)
    lookup_field = 'username'
    queryset = User.objects.all()
    serializer_class = UserSerializer


class PlaylistDetailsView(generics.GenericAPIView):
    permission_classes = (PlaylistPermission,)

    def get(self, request, link_id, format=None):
        playlist = Playlist.objects.get(link_id=link_id)
        serializer = PlaylistSerializer(playlist)
        data = serializer.data

        # we want username as owner, not pk
        if playlist.owner != None:
            data['owner'] = playlist.owner.username
        return Response(data=data, status=status.HTTP_200_OK)

    def patch(self, request, link_id, format=None):
        playlist = Playlist.objects.get(link_id=link_id)
        self.check_object_permissions(self.request, playlist)

        data = json.loads(request.body)
        if 'public_editable' in data:
            playlist.public_editable = data['public_editable']
        if 'public_visible' in data:
            playlist.public_visible = data['public_visible']

        playlist.save()
        send_channel_message("chat_"+link_id, "PERMISSIONS_CHANGE")
        return Response(data={}, status=status.HTTP_200_OK)

    def delete(self, request, link_id, format=None):
        playlist = Playlist.objects.get(link_id=link_id)
        self.check_object_permissions(self.request, playlist)
        playlist.delete()
        send_channel_message("chat_"+link_id, "PERMISSIONS_CHANGE")
        return Response(data={}, status=status.HTTP_200_OK)


class PlaylistsView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request, format=None):
        id = random_string(6)
        user = None
        if request.user.is_authenticated:
            user = request.user
        Playlist.objects.create(link_id=id, owner=user,
                                type=request.data.get('type'))
        return Response({'link_id': id}, status=status.HTTP_201_CREATED)

    def get(self, request, format=None):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        playlists = Playlist.objects.filter(owner=request.user)
        serializer = PlaylistSerializer(playlists, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)


class PlaylistElementsView(generics.GenericAPIView):
    permission_classes = (PlaylistElementsPermission,)
    serializer_class = PlaylistElementSerializer

    def get(self, request, link_id, format=None):
        playlist = Playlist.objects.get(link_id=link_id)
        self.check_object_permissions(self.request, playlist)
        playlistElements = PlaylistElement.objects.filter(playlist=playlist)
        serializer = PlaylistElementSerializer(playlistElements, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    def post(self, request, link_id, format=None):
        playlist = Playlist.objects.get(link_id=link_id)
        self.check_object_permissions(self.request, playlist)
        next_order = PlaylistElement.objects.filter(
            playlist=playlist).aggregate(Max('order'))['order__max']
        if next_order == None:
            next_order = 0
        data = json.loads(request.body)

        url = "https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=" \
              + data['id'] + "&key=AIzaSyAKkadTlzyGJd2h1Gz6x0AwruEJK2ebX0E"

        response = json.loads(requests.get(url).text)

        try:
            title = response['items'][0]['snippet']['title']
        except:
            return Response(status=status.HTTP_404_NOT_FOUND)

        PlaylistElement.objects.create(
            playlist=playlist,
            data=data['id'],
            order=next_order + 1,
            title=title,
        )

        # Notify users via websocket that playlist has been updated
        send_channel_message("chat_"+link_id, "PLAYLIST_ADD")
        return Response(status=status.HTTP_201_CREATED)

    def get_queryset(self):
        playlist = Playlist.objects.get(link_id=self.kwargs['link_id'])
        queryset = PlaylistElement.objects.filter(playlist=playlist)
        return queryset


class PlaylistElementDetailView(mixins.RetrieveModelMixin,
                                generics.GenericAPIView):
    permission_classes = (PlaylistElementPermission,)
    serializer_class = PlaylistElementSerializer
    lookup_field = 'order'

    def get_queryset(self):
        playlist = Playlist.objects.get(link_id=self.kwargs['link_id'])
        queryset = PlaylistElement.objects.filter(playlist=playlist)
        return queryset

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def patch(self, request, link_id, order):
        data = json.loads(request.body)
        if 'order' not in data:
            return Response(data="No order", status=status.HTTP_400_BAD_REQUEST)

        new_order = data['order']
        playlist = Playlist.objects.get(link_id=link_id)

        playlist_element = PlaylistElement.objects.get(
            playlist=playlist, order=order)
        self.check_object_permissions(self.request, playlist_element)

        max_order = PlaylistElement.objects.filter(
            playlist=playlist).aggregate(Max('order'))['order__max']

        if new_order < 1 or new_order > max_order:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        playlist_element.order = max_order + 1
        playlist_element.save()

        if (new_order < order):
            for i in range(order - 1, new_order - 1, -1):
                elem = PlaylistElement.objects.get(playlist=playlist, order=i)
                elem.order = i + 1
                elem.save()
        else:
            for i in range(order + 1, new_order + 1):
                elem = PlaylistElement.objects.get(playlist=playlist, order=i)
                elem.order = i - 1
                elem.save()

        playlist_element.order = new_order
        playlist_element.save()

        # Notify users via websocket that playlist has been updated
        send_channel_message("chat_"+link_id, "PLAYLIST_PATCH")
        return Response(data={}, status=status.HTTP_200_OK)

    def delete(self, request, link_id, order):
        playlist = Playlist.objects.get(link_id=link_id)
        playlist_element = PlaylistElement.objects.get(
            playlist=playlist, order=order)
        self.check_object_permissions(self.request, playlist_element)
        playlist_element.delete()

        max_order = PlaylistElement.objects.filter(
            playlist=playlist).aggregate(Max('order'))['order__max']
        if max_order == None:
            max_order = 0

        for i in range(order + 1, max_order + 1):
            elem = PlaylistElement.objects.get(playlist=playlist, order=i)
            elem.order = elem.order - 1
            elem.save()

        # Notify users via websocket that playlist has been updated
        send_channel_message("chat_"+link_id, "PLAYLIST_DELETE")
        return Response(data={}, status=status.HTTP_200_OK)


@api_view(['GET'])
def playlist_view(request):
    if request.method == 'GET':
        playlists = Playlist.objects.all()
        serializer = PlaylistSerializer(playlists, many=True)
        return Response(serializer.data)


def random_string(string_length):
    letters_and_digits = string.ascii_letters + string.digits
    return ''.join(random.choice(letters_and_digits) for i in range(string_length))


@api_view(['GET'])
def create_playlist(request):
    if request.method == 'GET':
        id = random_string(6)
        playlist = Playlist.objects.create(link_id=id)
        return Response({'link_id': id})


class PlaylistViewSet(viewsets.ModelViewSet):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer


def index(request):
    return render(request, 'wedj/index.html', context=None)


def playlist(request, playlist_id):
    try:
        playlist = Playlist.objects.get(link_id=playlist_id)
    except Playlist.DoesNotExist:
        return render(request, 'wedj/404.html', context=None)
    return render(request, 'wedj/playlist.html', {'playlist_id': playlist_id})


def youtube_query(request, query):
    #  'https://www.googleapis.com/youtube/v3/search?maxResults=25&q=surfitg&key=[YOUR_API_KEY]' \

    url = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=" + \
          query + "&key=AIzaSyAKkadTlzyGJd2h1Gz6x0AwruEJK2ebX0E"
    response = json.loads(requests.get(url).text)
    return JsonResponse(response)
