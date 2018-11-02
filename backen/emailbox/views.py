from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions, renderers
from .tools import  MyMail
from emailbox.action_view import ALLOW_MAIL_BOX
from emailbox.custom_authentication import BearerAuthentication


class MailboxView(APIView):
    '''
    从imap获取对应用户的邮件，默认是10条为一页，需要更改注意tools.py 中get_mails的范围
    params:
        currentPage 当前页数
        s 搜索字段，目前只有TEXT全局搜索
        mailBox 对应的邮箱目录名称
    '''
    authentication_classes = [BearerAuthentication, ]
    permission_classes = [permissions.IsAuthenticated, ]

    def get(self, request, format=None):
        page = int(request.query_params.get("currentPage", 1))
        search = request.query_params.get("s", None)
        mail_box = request.query_params.get("mailBox", None)
        if mail_box is None or mail_box.upper() not in ALLOW_MAIL_BOX:
            return Response({"message": "参数错误", "code": 500})
        excl = ['(', ')', '"', "'"]
        if search is not None:
            for one in excl:
                if one in search:
                    search = None
                    break
        mail_server = MyMail(page=page, search=search, user=request.user)
        mail_server.check_folder(mail_box)
        mails, totle = mail_server.get_mails(mail_box)
        mail_server.logout()
        return Response({
            "message": "success",
            "code": 200,
            "mails": mails,
            "pagination": {
                "total": totle,
                "currentPage": page
            }
        })


class DetailView(APIView):
    '''
    由提供的mail uid获取详细的邮件信息，包括附件
    '''
    authentication_classes = [BearerAuthentication, ]
    permission_classes = [permissions.IsAuthenticated, ]

    def get(self, request, pk, format=None):
        if pk is None:
            return Response({"message":"id is required", "code": 403})

        mail_box = request.query_params.get("mailBox", None)
        if mail_box is None or mail_box.upper() not in ALLOW_MAIL_BOX:
            return Response({"message": "参数错误", "code": 500})
        mail_server = MyMail(user=request.user)
        mail = mail_server.fetch_mail(pk, mail_box)
        mail_server.logout()
        if mail is None:
            return Response({
                "message": "fail, maybe is delete",
                "code": 500,
            })
        return Response({
            "message": "success",
            "code": 200,
            "mail": mail,
        })


class FileView(APIView):
    '''
    由对应mail uid 附件下载
    '''
    authentication_classes = [BearerAuthentication, ]
    permission_classes = [permissions.IsAuthenticated, ]

    def get(self, request, pk, format=None):
        part_id = request.query_params.get("part", None)
        if pk is None or part_id is None or not part_id:
            return Response({"message":"id is required", "code": 403})
        mail_server = MyMail(user=request.user)
        name, file_data, content_type, charset = mail_server.get_file_from_id(pk, part_id)
        mail_server.logout()
        return Response(
            file_data,
            headers={'Content-Disposition': 'attachment; filename="{}"'.format(name)},
            content_type=content_type,
        )




