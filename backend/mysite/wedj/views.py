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
from rest_framework import mixins
from rest_framework import status
from django.db.models import Max


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


class PlaylistElementsView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = PlaylistElementSerializer

    def get(self, request, link_id, format=None):
        playlist = Playlist.objects.get(link_id=link_id)
        playlistElements = PlaylistElement.objects.filter(playlist=playlist)
        serializer = PlaylistElementSerializer(playlistElements, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)

    def post(self, request, link_id, format=None):
        playlist = Playlist.objects.get(link_id=link_id)

        next_order = PlaylistElement.objects.filter(
            playlist=playlist).aggregate(Max('order'))['order__max']
        if next_order == None:
            next_order = 0
        data = json.loads(request.body)
        PlaylistElement.objects.create(
            playlist=playlist,
            data=data['data'],
            order=next_order+1)
        return Response(status=status.HTTP_201_CREATED)

    def get_queryset(self):
        playlist = Playlist.objects.get(link_id=self.kwargs['link_id'])
        queryset = PlaylistElement.objects.filter(playlist=playlist)
        return queryset


class PlaylistElementDetailView(mixins.RetrieveModelMixin,
                    generics.GenericAPIView):
    permission_classes = (AllowAny,)
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

        max_order = PlaylistElement.objects.filter(
            playlist=playlist).aggregate(Max('order'))['order__max']

        if new_order < 1 or new_order > max_order:
            return Response(status=status.HTTP_400_BAD_REQUEST)


        playlist_element.order = max_order+1
        playlist_element.save()
        print("Order0: ", order+1, " Order2 ", new_order+1)

        if(new_order < order):
            for i in range(order-1, new_order-1, -1):
                elem = PlaylistElement.objects.get(playlist=playlist, order=i)
                print("Order1: ", order+1, " Order2 ", new_order+1, " I: ", i)
                elem.order = i+1
                elem.save()
        else:
            for i in range(order+1, new_order+1):
                print("Order2: ", order+1, " Order2 ", new_order+1, " I: ", i)
                elem = PlaylistElement.objects.get(playlist=playlist, order=i)
                elem.order = i-1
                elem.save()

        playlist_element.order = new_order
        playlist_element.save()   
        return Response(status=status.HTTP_200_OK)

    def delete(self, request, link_id, order):
        playlist = Playlist.objects.get(link_id=link_id)
        playlist_element = PlaylistElement.objects.get(playlist=playlist, order=order)
        playlist_element.delete()

        for elem in PlaylistElement.objects.filter(playlist=playlist):
            if(elem.order > order):
                elem.order = elem.order-1
                elem.save()

        return Response(status=status.HTTP_204_NO_CONTENT)
    


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
