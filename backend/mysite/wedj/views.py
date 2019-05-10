from django.shortcuts import render

from django.http import HttpResponse
from .models import Playlist
from .models import User
from .models import PlaylistElement

from rest_framework import viewsets
from rest_framework.response import Response
from .serializers import PlaylistSerializer
from .serializers import UserSerializer, PlaylistElementSerializer
from .permissions import PlaylistPermission
from .permissions import UserDetailPermission

import string
import random

import requests
import json
from django.http import JsonResponse

from rest_framework import permissions
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from django.http import Http404
from rest_framework.permissions import AllowAny
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK
)
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def send_channel_message(group_name, message):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'test',
            'message': message,
        }
    )


def test(request):
    send_channel_message("chat_YUnV6w", "ttt3")
    print("elo")
    return render(request, 'wedj/404.html', context=None)


# class PlaylistView(generics.ListCreateAPIView):
#     queryset = Playlist.objects.all()
#     serializer_class = PlaylistSerializer()

class UsersView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    model = User
    serializer_class = UserSerializer


class UserDetailsView(generics.RetrieveUpdateAPIView):
    permission_classes = (UserDetailPermission,)
    lookup_field = 'username'
    queryset = User.objects.all()
    serializer_class = UserSerializer


class PlaylistDetailsView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (PlaylistPermission,)
    lookup_field = 'link_id'
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer


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


class PlaylistElementsView(generics.ListCreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = PlaylistElementSerializer

    def get_queryset(self):
        playlist = Playlist.objects.get(link_id=self.kwargs['link_id'])
        queryset = PlaylistElement.objects.filter(playlist=playlist)
        return queryset


class PlaylistElementDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (AllowAny,)
    serializer_class = PlaylistElementSerializer
    lookup_field = 'order'

    def get_queryset(self):
        playlist = Playlist.objects.get(link_id=self.kwargs['link_id'])
        queryset = PlaylistElement.objects.filter(playlist=playlist)
        return queryset


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
        query+"&key=AIzaSyAKkadTlzyGJd2h1Gz6x0AwruEJK2ebX0E"
    response = json.loads(requests.get(url).text)
    return JsonResponse(response)