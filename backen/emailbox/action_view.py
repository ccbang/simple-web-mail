from rest_framework.response import Response
from rest_framework.views import APIView
from .tools import MyMail
from rest_framework.authtoken.models import Token as AccessToken
from emailbox.smtp_tools import generate_oAuth2_string, create_email, send_web_mail
from emailbox.serializer import SendMailSerializer
from rest_framework import permissions
from emailbox.custom_authentication import BearerAuthentication

PERMITTED_FLAGS = [
    '\Flagged',
    '\Seen',
    '\Answered',
    '\Draft',
    '\Recent',
    'Work'
]

ALLOW_MAIL_BOX = [
    'INBOX',
    'SENT',
    'DELETE',
    'DRAFT'
]


class DeleteMailView(APIView):
    ''' 删除邮件接口'''
    authentication_classes = [BearerAuthentication, ]
    permission_classes = [permissions.IsAuthenticated, ]

    def post(self, request, *args, **kwargs):
        mail_uids = request.data.get("uid", None)
        is_delete = request.data.get("delete", False)
        if not mail_uids or mail_uids is None or not isinstance(mail_uids, list):
            return Response({"message": "删除失败!", "code": 500})

        mail_box = request.data.get("mailBox", None)
        if mail_box is None or mail_box.upper() not in ALLOW_MAIL_BOX:
            return Response({"message": "操作不明确", "code": 500})

        mail_server = MyMail(user=request.user)
        mail_server.imap.select(mail_box)
        if is_delete:  # 彻底删除
            mail_server.delete_mails(mail_uids)
        else:  # 移动到回收站
            for mail_uid in mail_uids:
                encode_id = "{}".format(mail_uid)
                mail_server.move_to_delete(encode_id.encode())
        mail_server.logout()
        return Response({"message": "操作成功!", "code": 200})


class AddFlagsView(APIView):
    ''' 增加标记接口'''
    authentication_classes = [BearerAuthentication, ]
    permission_classes = [permissions.IsAuthenticated, ]

    def post(self, request, *args, **kwargs):
        flag = request.data.get("flag", None)
        if flag not in PERMITTED_FLAGS or flag is None:
            return Response({"message": "操作失败", "code": 500})

        mail_uids = request.data.get("uid", None)
        if not mail_uids or mail_uids is None or not isinstance(mail_uids, list):
            return Response({"message": "数据不完整!", "code": 500})

        mail_box = request.data.get("mailBox", None)
        if mail_box is None or mail_box.upper() not in ALLOW_MAIL_BOX:
            return Response({"message": "操作不明确", "code": 500})

        mail_server = MyMail(user=request.user)
        mail_server.imap.select(mail_box)
        for one in mail_uids:
            one_id = "{}".format(one)
            mail_server.add_flags(one_id.encode(), flag)
        mail_server.logout()
        return Response({"message": "操作成功", "code": 200})


class RetrieveView(APIView):
    ''' 将Delete中的邮件取回'''
    authentication_classes = [BearerAuthentication, ]
    permission_classes = [permissions.IsAuthenticated, ]

    def post(self, request, *args, **kwargs):
        mail_uids = request.data.get("uid", None)
        if not mail_uids or mail_uids is None or not isinstance(mail_uids, list):
            return Response({"message": "数据不完整!", "code": 500})

        mail_box = request.data.get("mailBox", None)
        if mail_box != 'Delete':
            return Response({"message": "操作不明确", "code": 500})

        mail_server = MyMail(user=request.user)
        mail_server.imap.select(mail_box)
        for one in mail_uids:
            one_id = "{}".format(one)
            mail_server.retrieve_mail(one_id.encode())
        mail_server.logout()
        return Response({"message": "操作成功", "code": 200})


class SendMailView(APIView):
    ''' 发送邮件接口'''
    authentication_classes = [BearerAuthentication, ]
    permission_classes = [permissions.IsAuthenticated, ]

    def post(self, request, *args, **kwargs):
        serializer = SendMailSerializer(data=request.data)
        draft = request.data.get("draft", False)
        if serializer.is_valid() and not draft:
            tokens = AccessToken.objects.filter(user=request.user)
            if not tokens.exists():
                return Response({"message":"用户无法通过认证，请联系管理员", "code": 403})
            token = tokens.first()
            auth_string = generate_oAuth2_string(request.user.email, token.key)
            serializer.validated_data.update({"auth_string": auth_string})
            serializer.validated_data.update({"username": request.user.email})
            email = create_email(**serializer.validated_data)
            status, err = send_web_mail(email, auth_string)
            if not status:
                return Response({"message":"发送错误{}".format(err), "code": 500})
            else:
                # 将邮件存储到发件箱
                mail_server = MyMail(store=True, user=request.user)
                mail_server.store_mail(email, 'Sent')
                mail_server.logout()
                return Response({"message":"发送成功", "code": 200})
        elif draft:  # 如果提交为草稿箱
            tokens = AccessToken.objects.filter(user=request.user)
            if not tokens.exists():
                return Response({"message": "用户无法通过认证，请联系管理员", "code": 403})
            token = tokens.first()
            auth_string = generate_oAuth2_string(request.user.email, token.key)
            mail_info = request.data.copy()
            mail_info.update({"auth_string": auth_string})
            mail_info.update({"username": request.user.email})
            email = create_email(**mail_info)
            # 将邮件存储到发件箱
            mail_server = MyMail(store=True, user=request.user)
            mail_server.store_mail(email, 'Draft')
            mail_server.logout()
            return Response({"message": "草稿保存成功", "code": 200})
        return Response({"message":"提供的资料不全，请认真点..", "code": 401, "error": serializer.errors})


