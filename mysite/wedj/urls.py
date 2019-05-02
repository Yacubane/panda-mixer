from django.urls import include, path
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'playlist', views.PlaylistViewSet)
#router.register(r'playlist2', views.playlist_view)


urlpatterns = [
    #path('api/', views.PlaylistViewSet.as_view({'get': 'list'})),
    path('api/', include(router.urls)),
    path('api/create_playlist/', views.create_playlist),
    path('', views.index, name='index'),
    path('p/<str:playlist_id>/', views.playlist, name='playlist'),
    path('api/ytquery/<str:query>/', views.youtube_query),

]