import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import StudentLayout from '@/layouts/StudentLayout'
import TeacherLayout from '@/layouts/TeacherLayout'
import OutsideLayout from '@/layouts/OutsideLayout'
import AdminLayout from '@/layouts/AdminLayout'
import LabLeaderLayout from '@/layouts/LabLeaderLayout'
export const constantRoutes = [

  {
    path: '/',
    component: () => import('@/views/login/MainLogin')
  },

  {
    path: '/register',
    component: () => import('@/views/login/Register'),
    meta: {
      title: '用户注册'
    }
  },

  {
    path: '/visitor-login',
    component: () => import('@/views/login/VisitorLogin')
  },

  {
    path: '/admin-login',
    component: () => import('@/views/login/AdminLogin')
  },

  // 学生
  {
    path: '/student',
    component: StudentLayout,
    redirect: '/student/center',
    children: [
      {
        path: 'center',
        component: () => import('@/views/student/center'),
        meta: {
          title: '个人中心'
        }
      },
      {
        path: 'device',
        component: () => import('@/views/student/device')
      },
      {
        path: 'booking',
        component: () => import('@/views/student/booking')
      }
    ]
  },

  // 教师
  {
    path: '/teacher',
    component: TeacherLayout,
    redirect: '/teacher/center',
    children: [
      {
        path: 'center',
        component: () => import('@/views/teacher/center'),
        meta: {
          title: '个人中心',
          icon: 'el-icon-user'
        }
      },
      {
        path: 'device',
        component: () => import('@/views/teacher/device'),
        meta: {
          title: '设备列表',
          icon: 'el-icon-menu'
        }
      },
      {
        path: 'booking',
        component: () => import('@/views/teacher/booking'),
        meta: {
          title: '我的预约',
          icon: 'el-icon-date'
        }
      },
      {
        path: 'approval',
        component: () => import('@/views/teacher/approval'),
        meta: {
          title: '预约审批',
          icon: 'el-icon-s-check'
        }
      }
    ]
  },

  // 校外人员
  {
    path: '/outside',
    component: OutsideLayout,
    redirect: '/outside/center',
    children: [
      {
        path: 'center',
        component: () => import('@/views/outside/center'),
        meta: {
          title: '个人中心',
          icon: 'el-icon-user'
        }
      },
      {
        path: 'device',
        component: () => import('@/views/outside/device'),
        meta: {
          title: '设备列表',
          icon: 'el-icon-menu'
        }
      },
      {
        path: 'booking',
        component: () => import('@/views/outside/booking'),
        meta: {
          title: '我的预约',
          icon: 'el-icon-date'
        }
      }
    ]
  },

// 管理后台
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/device',

    children: [

      // ================= 设备管理 =================
      {
        path: 'device',
        component: () => import('@/views/admin/device.vue'),
        meta: {
          title: '设备管理',
          icon: 'el-icon-setting'
        }
      },

      // ================= 教师审批 =================
      {
        path: 'approval/teacher',
        component: () => import('@/views/admin/approval/teacher.vue'),
        meta: {
          title: '教师预约单',
          icon: 'el-icon-date'
        }
      },

      // ================= 学生审批 =================
      {
        path: 'approval/student',
        component: () => import('@/views/admin/approval/student.vue'),
        meta: {
          title: '学生二级审批单',
          icon: 'el-icon-document'
        }
      },

      // ================= 校外人员审批 =================
      {
        path: 'approval/outside',
        component: () => import('@/views/admin/approval/outside.vue'),
        meta: {
          title: '校外人员初审单',
          icon: 'el-icon-user'
        }
      }

    ]
  },
  // 实验室负责人后台
  {
    path: '/labLeader',
    component: LabLeaderLayout,
    redirect: '/labLeader/device',

    children: [

      {
        path: 'device',
        component: () => import('@/views/labLeader/device.vue'),
        meta: {
          title: '设备管理',
          icon: 'el-icon-setting'
        }
      },

      {
        path: 'approval',
        component: () => import('@/views/labLeader/approval.vue'),
        meta: {
          title: '预约审批',
          icon: 'el-icon-s-check'
        }
      },

      {
        path: 'staff',
        component: () => import('@/views/labLeader/staff.vue'),
        meta: {
          title: '员工管理',
          icon: 'el-icon-user'
        }
      },

      {
        path: 'stats',
        component: () => import('@/views/labLeader/stats.vue'),
        meta: {
          title: '数据统计',
          icon: 'el-icon-data-analysis'
        }
      }

    ]
  },

  {
    path: '*',
    redirect: '/'
  }
]


const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
