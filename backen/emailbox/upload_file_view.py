from rest_framework import viewsets
from rest_framework import permissions
from emailbox.serializer import UploadFileSerializer
from emailbox.models import UploadFile
from emailbox.custom_authentication import BearerAuthentication


class UploadFileViewSet(viewsets.ModelViewSet):
    '''
    上传文件数据库对应的更新/增加/删除
    '''
    authentication_classes = [BearerAuthentication, ]
    permission_classes = [permissions.IsAuthenticated, ]
    queryset = UploadFile.objects.all()
    serializer_class = UploadFileSerializer
