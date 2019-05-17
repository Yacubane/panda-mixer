from django.urls import include, path
from . import views
from rest_framework import routers
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
router = routers.DefaultRouter()
#router.register(r'playlist', views.PlaylistViewSet)
#router.register(r'playlist2', views.playlist_view)


urlpatterns = [
    #path('api/', views.PlaylistViewSet.as_view({'get': 'list'})),
    #path('api/', views.PlaylistView.as_view()),
    #path('api/', include(router.urls)),
    path('api/playlists/', views.PlaylistsView.as_view()),
    path('api/playlists/<str:link_id>/', views.PlaylistDetailsView.as_view()),
    path('api/playlists/<str:link_id>/elements/', views.PlaylistElementsView.as_view()),
    path('api/playlists/<str:link_id>/elements/<int:order>/', views.PlaylistElementDetailView.as_view()),
    path('api/users/', views.UsersView.as_view()),
    path('api/users/<str:user>', views.UserDetailsView.as_view()),
    path('', views.index, name='index'),
    path('p/<str:playlist_id>/', views.playlist, name='playlist'),
    path('api/ytquery/<str:query>/', views.youtube_query),
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/refresh_token/', TokenRefreshView.as_view()),

]