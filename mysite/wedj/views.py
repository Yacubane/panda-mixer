from django.shortcuts import render

from django.http import HttpResponse
from .models import Playlist

from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import PlaylistSerializer
import string, random

import requests
import json
from django.http import JsonResponse

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
        playlist = Playlist.objects.create(link_id = id)
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

    url = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q="+query+"&key=AIzaSyAKkadTlzyGJd2h1Gz6x0AwruEJK2ebX0E"
    response = json.loads(requests.get(url).text)
    return JsonResponse(response)
