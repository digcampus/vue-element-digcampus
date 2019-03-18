import request from '@/utils/request'

export function loginByUsername(username, password, fid) {
  const data = {
    username,
    password,
    fid
  }
  return request({
    url: '/login/login',
    method: 'get',
    params: data
  })
}

export function logout() {
  return request({
    url: '/login/logout',
    method: 'get'
  })
}

export function getUserInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

