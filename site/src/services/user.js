import request from '@/utils/request';
import { getCurrentUser } from '@/utils/authority';
import { stringify } from 'qs';

export async function query(params) {
  return request(`/api/user/?${stringify(params)}`);
}

export async function queryCurrent() {
  const userInfo = getCurrentUser();
  return request(`/api/user/${userInfo.id}/`);
}

export async function addVirtualUser(params) {
  return request('/api/user/', {
    method: 'POST',
    body: params,
  });
}

export async function updateUser(params) {
  const { id } = params;
  return request(`/api/user/${id}/`, {
    method: 'PATCH',
    body: params,
  });
}

export async function removeUser(params) {
  const { id } = params;
  return request(`/api/user/${id}/`, {
    method: 'DELETE',
  });
}

export async function bulkRemoveUser(params) {
  return request(`/api/user/bulkRemove/`, {
    method: 'POST',
    body: params,
  });
}
