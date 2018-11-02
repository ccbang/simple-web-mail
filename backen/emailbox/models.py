from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db.models.signals import post_save
from rest_framework.authtoken.models import Token
from django.dispatch import receiver
from django.conf import settings
from avatar_generator import Avatar

NOTICE = '通知'
MESSAGE = '消息'
WILLDO = '代办'
TODO = 'todo'
PROCESSING = 'processing'
URGENT = 'urgent'
DOING = 'doing'
TYPE_CHOICES = (
    (NOTICE, '通知'),
    (MESSAGE, '消息'),
    (WILLDO, '代办'),
)
STATUS_CHOICES = (
    (TODO, '正常'),
    (PROCESSING, '进行中'),
    (URGENT, '优先操作'),
    (DOING, '操作中')
)

class VirtualDomains(models.Model):
    name = models.CharField(max_length=100)


class MyUserManager(BaseUserManager):
    def create_user(self, email, date_of_birth, password=None):
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(
            email=self.normalize_email(email),
            date_of_birth=date_of_birth,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, date_of_birth, password):
        user = self.create_user(
            email,
            password=password,
            date_of_birth=date_of_birth,
        )
        user.is_admin = True
        user.save(using=self._db)
        return user

class VirtualUsers(AbstractBaseUser):
    domain = models.ForeignKey(
        'VirtualDomains',
        related_name='users',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
    )
    name = models.CharField(max_length=100, blank=True)
    maildir = models.CharField(max_length=200, blank=True)
    quota = models.IntegerField(default=200)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    status = models.CharField(max_length=100, default='default', choices=STATUS_CHOICES)
    create = models.DateTimeField(auto_now_add=True)
    modify = models.DateTimeField(auto_now=True)
    avatar = models.ImageField(blank=True, null=True)
    wechat_avatar= models.URLField(blank=True, null=True)
    wechat_id = models.CharField(max_length=100, blank=True)
    wechat_alias = models.CharField(max_length=100, blank=True)
    security_email = models.EmailField(blank=True, null=True)
    date_of_birth = models.DateField()
    last_login = models.DateTimeField(blank=True, null=True)

    objects = MyUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['date_of_birth']

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin

class VirtualAliases(models.Model):
    domain = models.ForeignKey(
        'VirtualDomains',
        related_name='aliases',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    source = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)


class Frend(models.Model):
    user = models.ForeignKey(
        'VirtualUsers',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='frends'
    )
    times = models.IntegerField(default=0)
    name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True)
    describes = models.CharField(blank=True, max_length=100)
    create_time = models.DateTimeField(auto_now_add=True)
    notice_time = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('email', '-create_time')


class TrashEmail(models.Model):
    report = models.ForeignKey(
        'VirtualUsers',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='trashs'
    )
    email = models.EmailField()
    mail_uid = models.IntegerField()
    describes = models.CharField(max_length=255)
    create_time = models.DateTimeField(auto_now_add=True)


class UploadFile(models.Model):
    user = models.ForeignKey(
        'VirtualUsers',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='files'
    )
    filename = models.CharField(max_length=100, blank=True)
    content_type = models.CharField(max_length=100, blank=True)
    charset = models.CharField(max_length=100, blank=True)
    file = models.FileField()
    upload_time = models.DateTimeField(auto_now_add=True)


class Notice(models.Model):
    user = models.ForeignKey(
        'VirtualUsers',
        on_delete=models.CASCADE,
        related_name='notices'
    )
    avatar = models.ImageField(blank=True, null=True)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    create_time = models.DateTimeField(auto_now_add=True)
    notice_type = models.CharField(
        max_length=100,
        choices=TYPE_CHOICES,
        default=NOTICE
    )
    status = models.CharField(
        max_length=100,
        choices=STATUS_CHOICES,
        default=TODO
    )


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    # 自动创建token和头像
    if created:
        Token.objects.create(user=instance)
        if not instance.avatar:
            avatar_name = "{}/avatar/{}.png".format(
                settings.MEDIA_ROOT, instance.username)
            with open(avatar_name, 'wb') as atf:
                atf.write(Avatar.generate(128, instance.username))
            instance.avatar = avatar_name
            instance.save()