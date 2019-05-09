from rest_framework import permissions


class PlaylistPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.owner == request.user:
            return True

        if request.method == 'GET' and obj.public_visible:
            return True

        return False


class UserDetailPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj == request.user:
            return True

        return False
