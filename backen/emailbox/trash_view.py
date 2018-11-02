from rest_framework import permissions, viewsets
from emailbox.models import TrashEmail
from emailbox.serializer import TrashEmailSerializer
from emailbox.custom_authentication import BearerAuthentication


class TrashViewSet(viewsets.ModelViewSet):
    '''
    垃圾邮件，没有用
    '''
    queryset = TrashEmail.objects.all()
    serializer_class = TrashEmailSerializer
    authentication_classes = [BearerAuthentication, ]
    permission_classes = [permissions.IsAuthenticated, ]