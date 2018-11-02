from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework import permissions, status
from rest_framework.decorators import action
from django.db.models import Q
from emailbox.serializer import VirtualAliasesSerializer, VirtualDomainsSerializer, VirtualUsersSerializer
from emailbox.models import VirtualUsers, VirtualAliases, VirtualDomains
from emailbox.custom_authentication import BearerAuthentication
from emailbox.custom_permission import IsOwnerOrAdmin


class UserViewSet(ModelViewSet):
    '''
    用户管理接口
        用户只可以获取/更新自己账号信息
        用户无法更新自己email字段
    '''
    queryset = VirtualUsers.objects.all()
    serializer_class = VirtualUsersSerializer
    authentication_classes = [BearerAuthentication, ]
    permission_classes = [permissions.IsAuthenticated,]

    def list(self, request, *args, **kwargs):
        search_value = request.query_params.get("search", None)
        queryset = self.filter_queryset(self.get_queryset())
        if search_value is not None:
            queryset = queryset.filter(
                Q(name__icontains=search_value) | Q(email__icontains=search_value)
            )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(methods=['post'], detail=False, url_path='bulkRemove', url_name='bulkRemove')
    def bulk_remove(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response({"message": "permission deny", "code": 401}, status=status.HTTP_403_FORBIDDEN)
        delete_list = request.data.get("deleteList", None)
        if delete_list is not None and isinstance(delete_list, list):
            self.queryset.filter(pk__in=delete_list).delete()
        return Response({"message": "删除成功", "code": 200})

    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [permissions.IsAuthenticated]
        elif self.action == 'retrieve':
            permission_classes = [IsOwnerOrAdmin]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]


class DomainViewSet(ModelViewSet):
    '''
    域名管理，目前支持单域名，如果需要多域名支持，需要更改微信登陆认证接口方法
    '''
    queryset = VirtualDomains.objects.all()
    serializer_class = VirtualDomainsSerializer
    authentication_classes = [BearerAuthentication, ]
    permission_classes = [permissions.IsAuthenticated, ]


class AliasViewSet(ModelViewSet):
    '''
    没用
    '''
    queryset = VirtualAliases.objects.all()
    serializer_class = VirtualAliasesSerializer
    authentication_classes = [BearerAuthentication, ]
    permission_classes = [permissions.IsAuthenticated, ]
