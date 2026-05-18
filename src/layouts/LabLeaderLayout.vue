<template>
  <BaseLayout
    :menus="menus"
    page-title="实验室负责人中心"
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
          title: '设备管理',
          path: '/labLeader/device',
          icon: 'el-icon-user'
        },

        {
          title: '预约审批',
          path: '/labLeader/approval',
          icon: 'el-icon-menu'
        },

        {
          title: '员工管理',
          path: '/labLeader/staff',
          icon: 'el-icon-date'
        },

        {
          title: '数据统计',
          path: '/labLeader/stats',
          icon: 'el-icon-s-check'
        }

      ]
    }
  }
}
</script>
