'''
登陆到imap，并进行一系列操作
'''
import email
import imaplib
from collections import defaultdict
from datetime import datetime
from django.conf import settings
from rest_framework.authtoken.models import Token
from emailbox.smtp_tools import generate_oAuth2_string
import pytz
import re
import time


class MyMail:

    def __init__(self, user, page=1, search=None, store=False):
        self.imap = imaplib.IMAP4(settings.CC_IMAP_HOST)
        if settings.CC_MAIL_ENCRYPT:
            self.imap.starttls()
        self.page = page
        self.search = search
        try:
            # imap认证, 可以用各种自己喜欢的方式认证，只要你的imap服务器支持
            token = Token.objects.get(user=user)
            self.imap.authenticate(
                'XOAUTH2',
                lambda x: generate_oAuth2_string(user.email, token, base64_encode=False)
            )
            if not store:
                self.imap.enable('UTF8=ACCEPT')
        except Exception as e:
            print(e)

    def get_subject(self, mail):
        # 获取邮件标题
        subject_item = mail.get("Subject")
        if subject_item is None:
            return None
        subject, code = email.header.decode_header(subject_item)[0]
        if code is not None:
            subject = subject.decode(code)
        return subject

    def get_to(self, mail):
        # 获取邮件送达人
        to_value = email.utils.getaddresses(mail.get_all('to', []))
        to_result = []
        for one in to_value:
            to_result.append(" ".join(one))
        return to_result

    def get_cc(self, mail):
        # 获取邮件发送人
        cc_value =  email.utils.getaddresses(mail.get_all('cc', []))
        cc_result = []
        for one in cc_value:
            cc_result.append(" ".join(one))
        return cc_result

    def get_bcc(self, mail):
        # 获取邮件发送人
        bcc_value = email.utils.getaddresses(mail.get_all('bcc', []))
        bcc_result = []
        for one in bcc_value:
            bcc_result.append(" ".join(one))
        return bcc_result

    def get_body(self, mail):
        # 迭代获取邮件内容和文件
        body = defaultdict(list)
        has_file = False
        if mail.is_multipart():
            # 如果包含了多个邮件，类似回复/附件等
            # now_content_type = None
            part_number = 1
            for part in mail.walk():
                maintype = part.get_content_maintype()
                if maintype != 'multipart' and part.get('Content-Disposition') is not None:
                    body["files"].append({
                        "size": len(part.get_payload()),
                        "fileName": part.get_filename(),
                        "partNumber": part_number
                    })
                    has_file = True
                    part_number += 1
                    continue
                if maintype == 'text':
                    my_code = part.get_content_charset()
                    if my_code is None:
                        content = part.get_payload(decode=True)
                    else:
                        content = part.get_payload(decode=True).decode(my_code).strip()
                    body["content"] = content
                    body["subtype"] = part.get_content_subtype()
                part_number += 1

        else:
            my_code = mail.get_content_charset()
            if my_code is None:
                body["content"] = mail.get_payload(decode=True)
            else:
                body["content"] = mail.get_payload(decode=True).decode(my_code).strip()
            body["subtype"] = mail.get_content_subtype()
            # body.append({
            #     "contentType": mail.get('Content-Type'),
            #     "content": mail.get_payload(decode=True).decode(my_code).strip()
            # })
        return body, has_file

    def get_from(self, mail):
        # 获取邮件发送人
        _, from_addr = email.utils.parseaddr(mail.get("From"))
        return from_addr

    def get_file_from_id(self, mail_id, part_id):
        # 获取邮件文件
        # mail_id 是uid
        # part_id 是邮件对应部分
        self.imap.select()
        num = "{}".format(mail_id)
        _, data = self.imap.uid('fetch', num.encode(), '(RFC822)')
        msg = email.message_from_bytes(data[0][1])
        counter = 1
        name = None
        body = None
        content_type = None
        charset = None
        for part in msg.walk():
            if counter != int(part_id):
                counter += 1
                continue
            name = part.get_filename()
            body = part.get_payload()
            content_type = part.get_content_type()
            charset = part.get_content_charset()
            break
        return name, body, content_type, charset

    def get_date_time(self, mail):
        # 获取邮件的日期
        get_time = mail.get("Date")
        if get_time is None:
            return None
        return email.utils.parsedate_to_datetime(get_time)

    def get_mail_info(self, mail, get_body=True):
        # 获取邮件详细信息，然后搞成json格式
        email_message = email.message_from_bytes(mail)
        one_mail = {
            "subject": self.get_subject(email_message),
            "from": self.get_from(email_message),
            "to": self.get_to(email_message),
            "dateTime": self.get_date_time(email_message),
            "bcc": self.get_bcc(email_message),
            "cc": self.get_cc(email_message),
        }
        mail_body, has_file = self.get_body(email_message)
        if not get_body:
            one_mail.update({"hasFile": has_file})
            return one_mail
        one_mail.update({"body": mail_body, "hasFile": has_file})
        return one_mail

    def search_mails(self):
        # 全局查找邮件用TEXT 模式，
        # 可以按照自己喜欢格式去查找，
        # 或者增加多种查找模式
        if self.search is None:
            typ, data = self.imap.uid('sort', '(REVERSE DATE)', 'UTF-8', 'ALL')
        else:
            typ, data = self.imap.uid(
                'sort',
                '(REVERSE DATE)',
                'UTF-8',
                '(TEXT "{search}")'.format_map(self.__dict__),
            )
        all_mail_id = data[0].split()
        return all_mail_id

    def get_mails(self, mail_box='INBOX'):
        # 获取邮件列表，不包括body/files
        ret = []
        self.imap.select(mail_box, readonly=True)
        all_mail_id = self.search_mails()
        begin = 10 * (self.page - 1)
        end = begin + 10
        for num in all_mail_id[begin:end]:
            # _, data = self.imap.fetch(num, '(RFC822)')
            _, response = self.imap.uid('fetch', num, '(RFC822 FLAGS)')
            response_data, *_ = response
            info, data, *_ = response_data
            flags = self.get_flags(info)
            one_mail = self.get_mail_info(data, get_body=False)
            one_mail.update({"id": int(num.decode())})
            one_mail.update({"flags": flags})
            ret.append(one_mail)
        return ret, len(all_mail_id)

    def get_flags(self, flags_info):
        ret = []
        pat_flag = re.compile(r'FLAGS\s+\(.*\)\s')
        pat = re.compile(r'[(](.*?)[)]')
        full_flag = re.findall(pat_flag, flags_info.decode())
        if not full_flag:
            return ret
        for i in re.findall(pat, full_flag[0]):
            ret.extend(i.split())
        return ret

    def fetch_mail(self, mail_id, mail_box='INBOX'):
        # 获取单个邮件，包括body，files
        self.imap.select(mail_box)
        num = "{}".format(mail_id)
        _, data = self.imap.uid('fetch', num.encode(), '(RFC822)')
        self.add_flags(num.encode(), '\Seen')
        if data[0] is None:
            return None
        one_mail = self.get_mail_info(data[0][1])
        one_mail.update({"id": int(mail_id)})
        return one_mail

    def store_mail(self, mail, folder):
        # 将邮件保存到对应目录
        self.check_folder(folder)  # 这里检查目录是否存在，不存在则会创建
        self.imap.select(folder)
        status, data = self.imap.append(
            folder,
            '',
            imaplib.Time2Internaldate(datetime.now(tz=pytz.UTC)),
            mail.as_bytes(unixfrom=True)
        )
        return status, data

    def check_folder(self, folder):
        # 检查文件夹是否存在，不存在则创建
        box_list = self.imap.list()[1]
        create = True
        for box in box_list:
            _, name, *_ = box.decode().split(' "." ')
            if name == '"{}"'.format(folder):
                create = False
                break
        if create:
            print(self.imap.create(folder))

    def add_flags(self, mail_uid, flag):
        self.imap.uid('store', mail_uid, '+FLAGS', flag)

    def move_to_delete(self, mail_id):
        # 将邮件移动到delete目录
        self.check_folder('Delete')
        status, data = self.imap.uid('COPY', mail_id, 'Delete')
        if status == 'OK':
            self.imap.uid('store', mail_id, '+FLAGS', '\\Deleted')
            self.imap.expunge()
        return status, data

    def retrieve_mail(self, mail_id):
        status, data = self.imap.uid('COPY', mail_id, 'INBOX')
        if status == 'OK':
            self.imap.uid('store', mail_id, '+FLAGS', '\\Deleted')
            self.imap.expunge()
        return status, data

    def delete_mails(self, mail_ids):
        # 真正删除邮件
        if isinstance(mail_ids, list):
            for one in mail_ids:
                encode_id = "{}".format(one)
                self.add_flags(encode_id.encode(), '\Deleted')
            self.imap.expunge()
            return True
        return False

    def logout(self):
        # 关闭imap连接
        self.imap.close()  # 关闭打开的目录，如INBOX
        self.imap.logout()  # 退出登陆


if __name__ == '__main__':
    from email.message import Message
    from email.utils import localtime, format_datetime

    new_message = Message()
    new_message['Subject'] = 'subject2'
    new_message['From'] = 'test1@example.com'
    new_message['To'] = 'test2@example.com'
    new_message['Date'] = format_datetime(localtime())
    new_message.set_payload('This is the body of the message.\n')
    print(new_message.as_bytes(unixfrom=True))
    mail_server = MyMail(store=True)

    mail_server.imap.append('Sent', '', imaplib.Time2Internaldate(time.time()), new_message.as_bytes(unixfrom=True))
