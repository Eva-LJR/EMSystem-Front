// import request from '@/utils/request'
//
// export function login(data) {
//   return request({
//     url: '/login',
//     method: 'post',
//     data
//   })
// }
//
// export function getInfo(token) {
//   return request({
//     url: '/users/info',
//     method: 'get',
//     params: { token }
//   })
// }
//
// export function logout() {
//   return request({
//     url: '/logout',
//     method: 'post'
//   })
// }
import request from '@/utils/request'
import qs from 'qs' // 使用 qs 库转换数据

export function login(data) {
  return request({
    url: '/vue-admin-template/user/login',
    method: 'post',
    data: data // 直接传入 JSON 对象
  })
}

export function register(data) {
  return request({
    url: '/vue-admin-template/user/register',
    method: 'post',
    data
  })
}


export function getInfo(token) {
  return request({
    url: '/vue-admin-template/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-admin-template/user/logout',
    method: 'post'
  })
}

export function getMyProfile() {
  return request({
    url: '/users/me',
    method: 'get'
  })
}

export function updateMyProfile(data) {
  return request({
    url: '/users/me',
    method: 'put',
    data
  })
}

export function getMyStudents() {
  return request({
    url: '/users/my-students',
    method: 'get'
  })
}