from django.urls import include, path
from . import views
from rest_framework import routers
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
router = routers.DefaultRouter()

urlpatterns = [
    path('api/playlists/', views.PlaylistsView.as_view()),
    path('api/playlists/<str:link_id>/', views.PlaylistDetailsView.as_view()),
    path('api/playlists/<str:link_id>/elements/', views.PlaylistElementsView.as_view()),
    path('api/playlists/<str:link_id>/elements/<int:order>/', views.PlaylistElementDetailView.as_view()),
    path('api/users/', views.UsersView.as_view()),
    path('api/users/<str:user>/', views.UserDetailsView.as_view()),
    path('api/ytquery/<str:query>/', views.youtube_query),
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/refresh_token/', TokenRefreshView.as_view()),

]