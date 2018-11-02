export function getAuthority() {
  // return localStorage.getItem('antd-pro-authority') || ['admin', 'user'];
  let authority = localStorage.getItem('user');
  if (authority) {
    if (authority.includes('[') || authority.includes('{')) {
      const userInfo = JSON.parse(authority);
      authority = userInfo.role;
    } else {
      authority = ['guest'];
    }
  } else {
    authority = ['guest'];
  }
  return authority;
}

export function setAuthority(authority) {
  return localStorage.setItem('user', JSON.stringify(authority));
}

export function getToken() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user.token;
  } catch (e) {
    localStorage.removeItem('user');
    return 'guest';
  }
}

export function getCurrentUser() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user;
  } catch (e) {
    localStorage.removeItem('user');
    return 'guest';
  }
}
