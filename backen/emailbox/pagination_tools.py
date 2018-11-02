from rest_framework import pagination
from rest_framework.response import Response


class CustomPagination(pagination.PageNumberPagination):
    '''
    自定义viewset 分页返回格式
    '''
    page_size_query_param = 'pageSize'

    def get_paginated_response(self, data):
        return Response({
            'pagination': {
                'total': self.page.paginator.count,
                'pageSize': self.get_page_size(self.request),
                'current': self.page.number
            },
            'results': data
        })