import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken, removeToken } from '@/utils/auth'
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false })

const whiteList = ['/', '/visitor-login', '/admin-login', '/register']

const roleHomeMap = {
  student: '/student/center',
  teacher: '/teacher/center',
  outside: '/outside/center',
  admin: '/admin/device',
  labLeader: '/labLeader/device'
}

function getRequiredRole(path) {
  if (path.startsWith('/student')) return 'student'
  if (path.startsWith('/teacher')) return 'teacher'
  if (path.startsWith('/outside')) return 'outside'
  if (path.startsWith('/admin')) return 'admin'
  if (path.startsWith('/labLeader')) return 'labLeader'
  return null
}

function getHomePath(role) {
  return roleHomeMap[role] || '/'
}

router.beforeEach(async(to, from, next) => {
  NProgress.start()
  document.title = getPageTitle(to.meta.title)

  const hasToken = getToken()

  if (!hasToken) {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next('/')
    }
    NProgress.done()
    return
  }

  try {
    let role = store.getters.role

    if (!role) {
      const userInfo = await store.dispatch('user/getInfo')
      role = userInfo.role || (userInfo.roles && userInfo.roles[0])
    }

    if (whiteList.includes(to.path)) {
      next(getHomePath(role))
      NProgress.done()
      return
    }

    const requiredRole = getRequiredRole(to.path)

    if (requiredRole && requiredRole !== role) {
      Message.warning('当前账号无权访问该页面，已返回对应角色首页')
      next(getHomePath(role))
      NProgress.done()
      return
    }

    next()
  } catch (error) {
    removeToken()
    await store.dispatch('user/resetToken')
    Message.error('登录状态已失效，请重新登录')
    next('/')
    NProgress.done()
  }
})

router.afterEach(() => {
  NProgress.done()
})