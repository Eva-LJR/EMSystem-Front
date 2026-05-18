<template>
  <BaseLayout
    :menus="menus"
    page-title="设备管理后台"
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
          path: '/admin/device',
          icon: 'el-icon-setting'
        },

        {
          title: '预约审批',
          path: '/admin/approval/teacher',
          icon: 'el-icon-date',
          // 新增：子菜单列表
          children: [
            {
              title: '教师预约单',
              path: '/admin/approval/teacher'
            },
            {
              title: '学生二级审批单',
              path: '/admin/approval/student'
            },
            {
              title: '校外人员初审单',
              path: '/admin/approval/outside'
            }
          ]
        }
      ]
    }
  }
}
</script>
