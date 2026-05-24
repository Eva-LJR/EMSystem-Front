<template>
  <BaseLayout
    :menus="menus"
    page-title="校外人员个人中心"
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
          path: '/outside/center',
          icon: 'el-icon-user'
        },

        {
          title: '设备列表',
          path: '/outside/device',
          icon: 'el-icon-menu'
        },

        {
          title: '我的预约',
          path: '/outside/booking',
          icon: 'el-icon-date'
        }

      ]
    }
  }
}
</script>
