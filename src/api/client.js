import request from '@/utils/request'

export function getClientDevices(params) {
  return request({
    url: '/client/devices',
    method: 'get',
    params
  })
}

export function getMyBookings() {
  return request({
    url: '/client/bookings',
    method: 'get'
  })
}

export function createBooking(data) {
  return request({
    url: '/client/bookings',
    method: 'post',
    data
  })
}

export function cancelBooking(id) {
  return request({
    url: `/client/bookings/${id}/cancel`,
    method: 'post'
  })
}

export function getStudentApprovals() {
  return request({
    url: '/client/student-approvals',
    method: 'get'
  })
}

export function approveStudentBooking(id) {
  return request({
    url: `/client/student-approvals/${id}/approve`,
    method: 'put'
  })
}

export function rejectStudentBooking(id) {
  return request({
    url: `/client/student-approvals/${id}/reject`,
    method: 'put'
  })
}

export function payBooking(id) {
  return request({
    url: `/client/bookings/${id}/pay`,
    method: 'post'
  })
}