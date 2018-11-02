# Mail Box

![create](https://raw.githubusercontent.com/ccbang/simple-web-mail/master/backen/mailBox.png)

仅供互相学习讨论

- 前端 [ANT DESIGN PRO][1]
- 后端 [Django >= 2.1][2]
- [postfix = 3.3.1][3]
- dovecot >= v2.2.28

### postfix/dovecot 配置说明

- postfix main.cf 配置 (省略号为默认额外配置)

```config
...
smtpd_sasl_auth_enable = yes
smtpd_sasl_security_options = noanonymous
broken_sasl_auth_clients = yes
smtpd_relay_restrictions = permit_sasl_authenticated,
                           permit_mynetworks,
                           check_relay_domains,
                           reject_unauth_destination,
                           ...
smtpd_tls_auth_only = no  # 如果这里配置为yes，后面shell认证方式不能用telnet，需要改用gnutls-cli，端口就是ssl端口了
smtp_use_tls = yes  # 启用ssl
smtpd_use_tls = yes  # 启用ssl
smtp_tls_note_starttls_offer = yes
smtpd_tls_key_file = /etc/postfix/ssl/privkey1.pem  # 证书
smtpd_tls_cert_file = /etc/postfix/ssl/fullchain1.pem # 证书
smtpd_tls_loglevel = 1
smtpd_tls_received_header = yes
smtpd_tls_session_cache_timeout = 3600s
smtp_sasl_mechanism_filter = xoauth2
smtpd_sasl_type = dovecot  # 这里特别注意下，使用dovecot认证方式
smtpd_sasl_path = private/auth  # 这里特别注意下，使用dovecot认证方式
...
```

- postfix master.cf 配置

```config
smtp      inet  n       -       n       -       -       smtpd
submission inet n       -       n       -       -       smtpd
  -o smtpd_tls_security_level=encrypt
  -o smtpd_sasl_auth_enable=yes
  -o smtpd_client_restrictions=permit_sasl_authenticated,reject
  -o milter_macro_daemon_name=ORIGINATING
smtps     inet  n       -       n       -       -       smtpd
  -o smtpd_tls_wrappermode=yes
  -o smtpd_sasl_auth_enable=yes
  -o smtpd_client_restrictions=permit_sasl_authenticated,reject
  -o milter_macro_daemon_name=ORIGINATING
...
```

### dovecot

dovecot 主要用来认证，我这里使用了 mysql 数据库，更多可以看[dovecot 官网][4]

- 安装（我使用了 bearar token 方式认证，版本号需要大于 v2.2.28，[具体配置看官网][5]）
  `./configure --with-sql --with-mysql # 下载源码包`

- dovecot conf.d/10-auth.conf 配置

```config
...
auth_mechanisms = xoauth2  # 增加xoauth2认证方式，可以多个认证并存

passdb {
  driver = oauth2
  mechanisms = xoauth2
  args = /usr/local/etc/dovecot/dovecot-oauth2.conf.ext  # token认证方式
}

userdb {
  driver = sql
  args = /usr/local/etc/dovecot/dovecot-userdb-sql.conf.ext  # 查询用户是否存在
}
...
```

- dovecot-oauth2.conf.ext

```config
introspection_url = http://xxxx.com/oauth/tokeninfo/
# 认证的url，认证通过后response必须返回带有email，is_active字段的json
introspection_mode = auth  # 认证方式，将认证token放在request header
active_attribute = is_active  # 用户状态对应键
active_value = true  # 用户状态对应的值
debug =  yes  # 调试开启日志
rawlog_dir = /tmp/oauth2  # 认证详细输出
```

- dovecot-userdb-sql.conf.ext

```config
driver = mysql
# 连接数据库需要的参数, 这里maildir注意要和dovecot的mail_location对应
# 查询字段必须有home，uid， gid
connect = host=127.0.0.1 dbname=dbname user=dbuser password=dbpass port=dbport
user_query = SELECT CONCAT('/var/vmail/', maildir) AS home, 2000 AS uid, 2000 AS gid, CONCAT('*:bytes=', quota) as quota_rule FROM emailbox_virtualusers WHERE email = '%u' AND is_active=true
```

- 开启 dovecot/postfix
  `dovecot`
  `service postfix start`

- 验证 IMAP 登陆认证效果

```Python
# 参考gmail xoauth2 认证 python
import base64
import imaplib
import smtplib
from email.message import EmailMessage

def generate_oAuth2_string(username_email, access_token, base64_encode=True):
    auth_string = 'user={}\1auth=Bearer {}\1\1'.format(username_email, access_token)
    if base64_encode:
        auth_string = base64.b64encode(auth_string.encode())
    return auth_string

def auth_imap(object):
    token = 'user token[string]'
    user = 'user@domain.com'
    imap = imaplib.IMAP4(imap.domain.com)
    imap.starttls()
    # 如果submission配置了ssl登陆，则需要使用ssl，再结合postfix main中的smtpd_relay_restrictions
    # 否则会出现imaplib.error: [PRIVACYREQUIRED] Authentication failed.
    imap.authenticate(
        'XOAUTH2', lambda x: generate_oAuth2_string(user, token, base64_encode=False)
    )

def auth_smtp(object):
    message = EmailMessage()
    message.set_content('Test for smtp auth')

    me == 'the sender's email address'
    you == 'the recipient's email address'
    message['Subject'] = 'The subject for test smtp auth'
    message['From'] = me
    message['To'] = you
    with smtplib.SMTP(smtp.domain.com) as s:
        s.starttls()
        s.docmd('AUTH', 'XOAUTH2 {}'.format(auth_string))
        s.send_message(message)
```

- shell 认证

```Shell
# shell认证要base64加密
$ echo -en 'user=user@example.com\001auth=Bearer 1234567890\001\001' | base64 -w0; echo
dXNlcj11c2VyQGV4YW1wbGUuY29tAWF1dGg9QmVhcmVyIDEyMzQ1Njc4OTABAQ==
```

`telnet imap.domain.com 143`(S 是表示服务端响应，C 是用户输入)

```config
S: * OK [CAPABILITY SASL-IRAUTH=PLAIN AUTH=XOAUTH2 AUTH=OAUTHBEARER ...] Dovecot ready.
C: 01 AUTHENTICATE XOAUTH2 dXNlcj11c2VyQGV4YW1wbGUuY29tAWF1dGg9QmVhcmVyIDEyMzQ1Njc4OTABAQ==
S: 01 OK [CAPABILITY IMAP4rev1 ...] Logged in
```

`telnet smtp.domain.com 25`(S 是表示服务端响应，C 是用户输入)

```config
S: 220 debian-jessie.vagrantup.com ESMTP Postfix (Debian/GNU)
C: EHLO localhost
S: 250-debian-jessie.vagrantup.com
S: 250-AUTH PLAIN XOAUTH2 OAUTHBEARER
C: AUTH XOAUTH2 dXNlcj11c2VyQGV4YW1wbGUuY29tAWF1dGg9QmVhcmVyIDEyMzQ1Njc4OTABAQ==
S: 235 2.7.0 Authentication successful
```

## Django 配置(>=2.1)

### 依赖

- rest_framework
- corsheaders
- django-filter
- requests
- avatar-generator

`settings.py 需要的配置`

```config
...
# mail认证服务器是否开启SSL
CC_MAIL_ENCRYPT = True
# imap 服务器地址
CC_IMAP_HOST = 'mail.domain.com'
# smtp 发邮件服务器地址
CC_SMTP_HOST = 'mail.domain.com'
# 微信企业号cid， 用于扫码登陆
CC_WECHAT_APPID = 'cid'
# 企业微信中应用app密钥，用于扫码登陆
CC_WECHAT_SECERT = 'secert'
# 企业微信应用app id， agent id ，用于扫码登陆
CC_WECHAT_AGENTID = '1000000'
```

[1]: https://pro.ant.design/index-cn
[2]: https://www.djangoproject.com/
[3]: http://www.postfix.org/
[4]: https://wiki.dovecot.org
[5]: https://wiki.dovecot.org/PasswordDatabase/oauth2
