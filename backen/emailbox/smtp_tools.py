import smtplib
import mimetypes
import base64
from email.message import EmailMessage
from emailbox.models import UploadFile
from email.utils import localtime, format_datetime
from django.conf import settings


def create_email(username, **kwargs):
    # subject邮件标题 string
    # to list or string
    # username email for me
    # content_text  plain内容
    # content_html html内容
    # files uploadFile pk列表
    cc = kwargs.get("cc", None)
    bcc = kwargs.get("bcc", None)
    subject = kwargs.get("subject", None)
    content_text = kwargs.get("content_text", None)
    to = kwargs.get("to", [])
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['To'] = ', '.join(to)
    msg['Date'] = format_datetime(localtime())
    msg.add_header('MIME-Version', '1.0')
    if cc is not None:
        msg['Cc'] = ', '.join(cc)
    if bcc is not None:
        msg['Bcc'] = ', '.join(bcc)
    msg['From'] = username
    msg.set_content(content_text)
    content_html = kwargs.get("content_html", None)
    if content_html is not None:
        # 如果有html内容，则增加进来
        msg.add_alternative(content_html, subtype='html')

    files = kwargs.get("file_list", None)
    if files is not None and isinstance(files, list):
        # 如果有附件，将附加到邮件中
        print(files)
        msg.add_header('X-FILE-LIST', ','.join([str(i) for i in files]))
        for one_pk in files:
            one_objs = UploadFile.objects.filter(pk=one_pk)
            if not one_objs.exists():
                continue
            one_obj = one_objs.first()
            ctype, encoding = mimetypes.guess_type(one_obj.filename)
            if ctype is None or encoding is not None:
                ctype = 'application/octet-stream'
            maintype, subtype = ctype.split('/', 1)
            with one_obj.file.open('rb') as fp:
                msg.add_attachment(
                    fp.read(),
                    maintype=maintype,
                    subtype=subtype,
                    filename=one_obj.filename
                )
    return msg


def send_web_mail(message, auth_string):
    # 连接smtp服务器，认证，发送邮件
    try:
        with smtplib.SMTP(settings.CC_SMTP_HOST) as s:
            s.starttls()
            s.docmd('AUTH', 'XOAUTH2 {}'.format(auth_string))
            s.send_message(message)
        result = True, None
    except Exception as e:
        result = False, e
    finally:
        return result

def generate_oAuth2_string(username_email, access_token, base64_encode=True):
  auth_string = 'user={}\1auth=Bearer {}\1\1'.format(username_email, access_token)
  if base64_encode:
    auth_string = base64.b64encode(auth_string.encode()).decode()
  return auth_string

