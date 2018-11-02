from rest_framework import permissions
from rest_framework import  viewsets
from emailbox.custom_authentication import BearerAuthentication
from emailbox.models import Notice
from emailbox.serializer import NoticeSerializer



class NoticeViewSet(viewsets.ModelViewSet):
    '''
    消息通知接口
    '''
    queryset = Notice.objects.all()
    authentication_classes = (BearerAuthentication, )
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = NoticeSerializer
