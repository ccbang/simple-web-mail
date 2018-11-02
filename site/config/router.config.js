export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './User/Login' },
      { path: '/user/forgot', component: './User/Forgot' },
      { path: '/user/forgot-result', component: './User/ForgotResult' },
      { path: '/user/wechat', component: './User/Wechat' },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    authority: ['admin', 'user'],
    routes: [
      // dashboard
      { path: '/', redirect: '/mails/mailbox' },
      { path: '/frends', name: 'frends', icon: 'team', component: './Frends' },
      {
        path: '/mails',
        name: 'email',
        icon: 'mail',
        routes: [
          {
            path: '/mails/create',
            name: 'create',
            component: './Mails/Create/Create',
          },
          {
            path: '/mails/mailbox',
            name: 'mailbox',
            component: './Mails/MailBox',
          },
          {
            path: '/mails/send',
            name: 'send',
            component: './Mails/Send',
          },
          {
            path: '/mails/delete',
            name: 'delete',
            component: './Mails/Deleted',
          },
          {
            path: '/mails/befor',
            name: 'befor',
            component: './Mails/Befor',
          },
          {
            path: '/mails/detail/:mailBox/:id',
            name: 'detail',
            component: './Mails/ViewDetail',
            hideInMenu: true,
          },
        ],
      },
      {
        path: '/settings',
        name: 'settings',
        icon: 'setting',
        component: './Settings',
        authority: ['admin'],
      },
      {
        path: '/account/settings',
        name: 'account',
        icon: 'user',
        component: './Account/Settings/Info',
        routes: [
          {
            path: '/account/settings',
            redirect: '/account/settings/base',
          },
          {
            path: '/account/settings/base',
            component: './Account/Settings/BaseView',
          },
          {
            path: '/account/settings/security',
            component: './Account/Settings/SecurityView',
          },
          {
            path: '/account/settings/binding',
            component: './Account/Settings/BindingView',
          },
          {
            path: '/account/settings/notification',
            component: './Account/Settings/NotificationView',
          },
        ],
      },
      {
        component: '404',
      },
    ],
  },
];
