from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import requests
import os
import json
import string
import random
from emailbox.models import VirtualDomains, VirtualUsers


def get_wechat_token(cid):
    # 获取企业微信token，用于微信接口认证或者各种操作
    # token将记录到本地，具体token时效需要查阅企业微信API文档
    token_tmp = '{}{}wechat_token'.format(settings.MEDIA_ROOT, os.sep)
    now_time = timezone.now()
    end_tone = None
    if os.path.exists(token_tmp):
        with open(token_tmp) as wf:
            last_time, end_tone = wf.read().split()
    else:
        two_hour_ago = now_time - timedelta(seconds=7200)
        last_time = two_hour_ago.timestamp()
    if int(now_time.timestamp()) - int(last_time) > 7100:
        token_url = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken'
        token_params = {"corpid": cid, "corpsecret": settings.CC_WECHAT_SECERT}
        token_info = requests.get(token_url, params=token_params)
        token = token_info.json()
        if not token or "access_token" not in token:
            return None
        end_tone =  token.get("access_token")
        try:
            write_str = "{} {}".format(now_time.timestamp(), end_tone)
            with open(token_tmp, 'w') as weixinf:
                weixinf.write(write_str)
        except Exception as e:
            print('write token err', e)
    return end_tone

def get_wechat_user(token, code):
    # 扫码后，从企业微信接口获取用户id
    info_url = 'https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo'
    user_params = {"access_token": token, "code": code}
    user_result = requests.get(info_url, params=user_params)
    result = user_result.json()
    if not result or "UserId" not in result:
        return None

    user_id = result.get("UserId")
    ret = None
    try:
        domains = list(VirtualDomains.objects.values_list('name', flat=True))
        users = ["{}@{}".format(user_id.lower(), one) for one in domains]
        user_objs = VirtualUsers.objects.filter(email__in=users)
        if not user_objs.exists():
            ret = None
        else:
            ret = user_objs.first()
    except Exception as e:
        print(e)
        ret = None
    finally:
        get_wechat_avavtar(token, user_id, ret)
        return ret


def get_wechat_avavtar(token, user_id, user_obj):
    # 获取更多用户信息，并存在数据库
    try:
        url = 'https://qyapi.weixin.qq.com/cgi-bin/user/get'
        params = {"access_token": token, "userid": user_id}
        response = requests.get(url, params=params)
        user_info = response.json()
        if 'avatar' in user_info:
            user_obj.wechat_avatar = user_info.get("avatar")
            user_obj.wechat_id = user_id
            user_obj.wechat_alias = user_info.get("alias", '')
            user_obj.save()
    except Exception as e:
        print("get avatar error", e)


def wechat_send_text(msg, username, safe='1'):
    # 用微信接口发送text消息
    token = get_wechat_token(settings.CC_WECHAT_APPID)
    url = 'https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token={}'.format(token)
    if isinstance(username, list):
        touser = "|".join(username)
    else:
        touser = username
    data = {
        "touser": touser,
        "msgtype": "text",
        "agentid": settings.CC_WECHAT_AGENTID,
        "text": {
            "content": msg
        },
        "safe": safe
    }
    send_msg = json.dumps(data, ensure_ascii=False)
    header = {'Content-Type': 'application/json','encoding':'utf-8'}
    response = requests.post(url, headers=header, data=send_msg)
    print(response.json())


def reset_password(user_obj):
    # 重新配置密码，并发送消息给用户
    ret = False
    try:
        new_password = random_password(8)
        user_obj.set_password(new_password)
        user_obj.save()
        msg = "new ({}) pass".format(new_password)
        wechat_send_text(msg, user_obj.wechat_id)
        ret = True
    except Exception as e:
        print(e)
    finally:
        return ret



def random_password(object):
    # 随机生成8-12位字符串，用于重置密码
    chars = string.ascii_uppercase + string.ascii_lowercase + string.digits
    size = random.randint(8, 12)
    return ''.join(random.choice(chars) for x in range(size))