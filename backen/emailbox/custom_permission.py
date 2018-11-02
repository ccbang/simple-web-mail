from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    用户只能管理自己信息，管理员直接返回True
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True

        return obj == request.user