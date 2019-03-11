import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/ueditor/list',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/ueditor/detail/' + id,
    method: 'get'
  })
}

export function fetchPv(pv) {
  return request({
    url: '/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/article/create',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/article/update',
    method: 'post',
    data
  })
}

export function saveArticle(data) {
  return request({
    url: '/ueditor/save',
    method: 'post',
    data
  })
}

export function deleteArticle(id) {
  return request({
    url: '/ueditor/del/' + id,
    method: 'get'
  })
}

export function publishArticle(data) {
  return request({
    url: '/ueditor/publish',
    method: 'post',
    data
  })
}

export function publishWechatMsg(data) {
  return request({
    url: '/wechat/message/send',
    method: 'post',
    data
  })
}

export function getTemplateWidget(id, content) {
  return request({
    url: '/wechat/template/' + id,
    method: 'get',
    params: { 'content': content }
  })
}
