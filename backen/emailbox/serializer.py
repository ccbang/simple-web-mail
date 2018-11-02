from rest_framework import serializers
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.password_validation import validate_password
from emailbox.models import Frend, TrashEmail, UploadFile, VirtualDomains, VirtualAliases, VirtualUsers, Notice
from emailbox import wechat_tools


class DetailActionSerializer(serializers.Serializer):
    action = serializers.CharField(required=True)
    id = serializers.IntegerField()


class FrendSerializer(serializers.ModelSerializer):
    class Meta:
        model = Frend
        fields = '__all__'

    def create(self, validated_data):
        request = self.context.get("quests", None)
        if hasattr(request, 'user'):
            validated_data.update({"user": request.user})
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get("quests", None)
        if hasattr(request, 'user'):
            validated_data.update({"user": request.user})
        return super().update(instance, validated_data)


class TrashEmailSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrashEmail
        fields = '__all__'

    def create(self, validated_data):
        request = self.context.get("quests", None)
        if hasattr(request, 'user'):
            validated_data.update({"user": request.user})
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get("quests", None)
        if hasattr(request, 'user'):
            validated_data.update({"user": request.user})
        return super().update(instance, validated_data)


class UploadFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadFile
        fields = "__all__"

    def create(self, validated_data):
        request = self.context.get("quests", None)
        if hasattr(request, 'user'):
            validated_data.update({"user": request.user})
        file_obj = validated_data.get("file")

        validated_data.update({
            "content_type": file_obj.content_type,
            "filename": file_obj.name
        })
        if file_obj.charset is not None:
            validated_data.update({"charset": file_obj.charset})
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get("quests", None)
        if hasattr(request, 'user'):
            validated_data.update({"user": request.user})
        return super().update(instance, validated_data)


class SendMailSerializer(serializers.Serializer):
    uid = serializers.IntegerField(required=False)
    subject = serializers.CharField(max_length=200)
    to = serializers.ListField(child=serializers.EmailField())
    cc = serializers.ListField(child=serializers.EmailField(), required=False)
    bcc = serializers.ListField(child=serializers.EmailField(), required=False)
    content_text = serializers.CharField()
    content_html = serializers.CharField(required=False)
    file_list = serializers.ListField(child=serializers.IntegerField(), required=False)


class VirtualUsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = VirtualUsers
        # fields = "__all__"
        exclude = ("password",)

    def update(self, instance, validated_data):
        if validated_data.get("email", None) is not None:
            validated_data.pop('email')
        return super().update(instance, validated_data)


class VirtualAliasesSerializer(serializers.ModelSerializer):
    class Meta:
        model = VirtualAliases
        fields = "__all__"


class VirtualDomainsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VirtualDomains
        fields = "__all__"


class NoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = "__all__"


class AuthTokenWechatSerializer(serializers.Serializer):
    appid = serializers.CharField(label=_("appid"))
    code = serializers.CharField(
        label=_("code"),
        style={'input_type': 'password'},
        trim_whitespace=False
    )
    state = serializers.CharField(label=_("state"))

    def validate(self, attrs):
        appid = attrs.get('appid')
        code = attrs.get('code')
        state = attrs.get('state')

        if appid and code and state:
            wechat_token = wechat_tools.get_wechat_token(appid)
            if wechat_token is None:
                msg = _('Unknow wechat token in with provided credentials.')
                raise serializers.ValidationError(msg, code='authorization')

            user = wechat_tools.get_wechat_user(wechat_token, code)
            # The authenticate call simply returns None for is_active=False
            # users. (Assuming the default ModelBackend authentication
            # backend.)
            print(user)
            if not user:
                msg = _('Unable to log in with provided credentials.')
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = _('Must include "appid" and "code" and "state".')
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """
        Serializer for password change endpoint.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class ForgotPasswordSerializer(serializers.Serializer):
    """
        Serializer for password change endpoint.
    """
    email = serializers.CharField(required=True)
    phone = serializers.CharField(required=True)
