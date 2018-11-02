from rest_framework import permissions, status
from rest_framework import parsers, renderers, generics
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.compat import coreapi, coreschema
from rest_framework.response import Response
from rest_framework.schemas import ManualSchema
from rest_framework.views import APIView
from django.utils import timezone
from django.conf import settings
from emailbox.custom_authentication import BearerAuthentication
from emailbox.models import VirtualUsers
from emailbox import wechat_tools
from emailbox.serializer import AuthTokenWechatSerializer, ForgotPasswordSerializer, ChangePasswordSerializer
from urllib.parse import quote


class AuthView(APIView):
    '''
    提供给dovecot oxauth2 认证回调
    '''
    authentication_classes = [BearerAuthentication, ]
    permission_classes = [permissions.IsAuthenticated,]

    def get(self, request, format=None):
        if request.user.email is not None:
            return  Response({
                "email": request.user.email,
                "is_active": request.user.is_active
            })
        return Response(status=status.HTTP_204_NO_CONTENT)


class MailAuthToken(APIView):
    '''
    用户登陆接口
    '''
    throttle_classes = ()
    permission_classes = ()
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    if coreapi is not None and coreschema is not None:
        schema = ManualSchema(
            fields=[
                coreapi.Field(
                    name="username",
                    required=True,
                    location='form',
                    schema=coreschema.String(
                        title="Username",
                        description="Valid username for authentication",
                    ),
                ),
                coreapi.Field(
                    name="password",
                    required=True,
                    location='form',
                    schema=coreschema.String(
                        title="Password",
                        description="Valid password for authentication",
                    ),
                ),
            ],
            encoding="application/json",
        )

    def post(self, request, *args, **kwargs):
        auth_type = request.data.get("type", None)
        if auth_type == "wechat":
            serializer = AuthTokenWechatSerializer(
                data=request.data,
                context={'request': request}
            )
        else:
            serializer = AuthTokenSerializer(
                data=request.data,
                context={'request': request}
            )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        user.last_login = timezone.now()
        user.save()
        token, created = Token.objects.get_or_create(user=user)
        role = ['user']
        if user.is_staff:
            role.append('admin')
        return Response({
            'status': "ok",
            'type': "account",
            "currentAuthority": {
                'token': token.key,
                'id': user.pk,
                'email': user.email,
                'name': user.name,
                'role': role,
            }
        })

    def get(self, request, *args, **kwargs):
        data = {
            "appid": settings.CC_WECHAT_APPID,
            "agentid": settings.CC_WECHAT_AGENTID,
            "state": '123456789',
            "redirect_uri": quote('http://mail.import-project.com:8000/user/wechat/')
        }
        return Response(data)


class ChangePasswordView(generics.UpdateAPIView):
    """
    修改密码接口
    """
    serializer_class = ChangePasswordSerializer
    model = VirtualUsers
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = [BearerAuthentication, ]

    def get_object(self, queryset=None):
        obj = self.request.user
        return obj

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            # set_password also hashes the password that the user will get
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            return Response({"message": 'success'}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    '''
    忘记密码后直接重置，并发送到微信
    '''
    throttle_classes = ()
    permission_classes = ()
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)
    serializer_class = ForgotPasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        user_obj = VirtualUsers.objects.get(email=serializer.data.get("email"))
        if user_obj.wechat_id is not None:
            if wechat_tools.reset_password(user_obj):
                return Response({"message":"已经发送到你的微信上", "code": 200, "status":"ok"})
        return Response({"message": "请联系系统管理员， 或者关注对应企业号", "code": 500})
