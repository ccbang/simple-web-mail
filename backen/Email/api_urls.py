from django.urls import path, include
from emailbox.views import  MailboxView, DetailView, FileView
from emailbox.action_view import DeleteMailView, AddFlagsView, RetrieveView, SendMailView
from emailbox.frend_view import FrendViewSet
from emailbox.trash_view import TrashViewSet
from emailbox.upload_file_view import UploadFileViewSet
from emailbox.mail_admin_view import UserViewSet, AliasViewSet, DomainViewSet
from rest_framework.routers import DefaultRouter
from emailbox.auth_view import AuthView, MailAuthToken, ChangePasswordView, ForgotPasswordView

app_name = 'api'

urlpatterns = [
    path('auth/', MailAuthToken.as_view(), name="auth"),
    path('auth/change/', ChangePasswordView.as_view(), name="change"),
    path('auth/forgot/', ForgotPasswordView.as_view(), name="forgot"),
    path('oauth/tokeninfo/', AuthView.as_view(), name='tokeninfo'),
    path('mailbox/', MailboxView.as_view(), name='mailbox'),
    path('detail/<int:pk>/', DetailView.as_view(), name='detail'),
    path('file/<int:pk>/', FileView.as_view(), name='file'),
    path('action/delete/', DeleteMailView.as_view(), name='delete'),
    path('action/flag/', AddFlagsView.as_view(), name='flag'),
    path('action/retrieve/', RetrieveView.as_view(), name='retrieve'),
    path('action/send/', SendMailView.as_view(), name='send'),
]

router = DefaultRouter()
router.register(r'frend', FrendViewSet, base_name='frend')
router.register(r'trash', TrashViewSet, base_name='trash')
router.register(r'upload', UploadFileViewSet, base_name='upload')
router.register(r'user', UserViewSet, base_name='user')
router.register(r'alias', AliasViewSet, base_name='alias')
router.register(r'domain', DomainViewSet, base_name='domain')

urlpatterns += router.urls