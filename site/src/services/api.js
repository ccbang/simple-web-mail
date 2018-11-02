import { stringify } from 'qs';
import request from '@/utils/request';

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeAccountLogin(params) {
  return request('/api/auth/', {
    method: 'POST',
    body: params,
  });
}

export async function fakeAccountInfo(params) {
  return request(`/api/auth/?${stringify(params)}`);
}

export async function fakeForgot(params) {
  return request('/api/auth/forgot/', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChangePassword(params) {
  return request('/api/auth/change/', {
    method: 'PUT',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}

export async function queryMailBox(params) {
  return request(`/api/mailbox/?${stringify(params)}`);
}

export async function queryMailBoxDetail(params) {
  const { id } = params;
  return request(`/api/detail/${id}/?${stringify(params)}`);
}

export async function addFlags(params) {
  return request('/api/action/flag/', {
    method: 'POST',
    body: params,
  });
}

export async function mailDelete(params) {
  return request('/api/action/delete/', {
    method: 'POST',
    body: params,
  });
}

export async function mailRetrieve(params) {
  return request('/api/action/retrieve/', {
    method: 'POST',
    body: params,
  });
}

export async function sendMail(params) {
  return request('/api/action/send/', {
    method: 'POST',
    body: params,
  });
}

export async function queryFrends(params) {
  return request(`/api/frend/?${stringify(params)}`);
}

export async function addFrend(params) {
  return request('/api/frend/', {
    method: 'POST',
    body: params,
  });
}

export async function updateFrend(params) {
  const { id } = params;
  return request(`/api/frend/${id}/`, {
    method: 'PATCH',
    body: params,
  });
}

export async function removeFrend(params) {
  const { id } = params;
  return request(`/api/frend/${id}/`, {
    method: 'DELETE',
  });
}

export async function bulkRemoveFrend(params) {
  return request(`/api/frend/bulkRemove/`, {
    method: 'POST',
    body: params,
  });
}

// trash
export async function queryTrashs(params) {
  return request(`/api/trash/?${stringify(params)}`);
}

export async function addTrash(params) {
  return request('/api/trash/', {
    method: 'POST',
    body: params,
  });
}

export async function updateTrash(params) {
  const { id } = params;
  return request(`/api/trash/${id}/`, {
    method: 'PATCH',
    body: params,
  });
}

export async function removeTrash(params) {
  const { id } = params;
  return request(`/api/trash/${id}/`, {
    method: 'DELETE',
  });
}
