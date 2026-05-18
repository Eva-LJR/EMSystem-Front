<template>
  <BaseLayout
    :menus="menus"
    page-title="教师个人中心"
  />
</template>

<script>

import BaseLayout from '@/components/BaseLayout'

export default {

  components: {
    BaseLayout
  },

  data() {
    return {

      menus: [

        {
          title: '个人中心',
          path: '/teacher/center',
          icon: 'el-icon-user'
        },

        {
          title: '设备列表',
          path: '/teacher/device',
          icon: 'el-icon-menu'
        },

        {
          title: '我的预约',
          path: '/teacher/booking',
          icon: 'el-icon-date'
        },

        {
          title: '预约审批',
          path: '/teacher/approval',
          icon: 'el-icon-s-check'
        }

      ]
    }
  }
}
</script>
