from rest_framework.authentication import TokenAuthentication


class BearerAuthentication(TokenAuthentication):
    '''
    将request header 中Authorization 用Bearser认证
    '''
    keyword = 'Bearer'