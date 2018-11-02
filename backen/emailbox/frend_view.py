from rest_framework.response import Response
from rest_framework import permissions, viewsets
from django.db.models import Q
from django_filters import rest_framework as filters
from rest_framework.decorators import action
from emailbox.models import Frend
from emailbox.serializer import FrendSerializer
from emailbox.custom_authentication import BearerAuthentication


class FrendViewSet(viewsets.ModelViewSet):
    '''
    通讯录接口
        查询接口匹配name/email，需要更改就直接改queryset
    '''
    queryset = Frend.objects.all()
    serializer_class = FrendSerializer
    authentication_classes = [BearerAuthentication, ]
    permission_classes = [permissions.IsAuthenticated, ]
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('name', 'email')


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
        delete_list = request.data.get("deleteList", None)
        if delete_list is not None and isinstance(delete_list, list):
            self.queryset.filter(pk__in=delete_list).delete()
        return Response({"message": "删除成功", "code": 200})
