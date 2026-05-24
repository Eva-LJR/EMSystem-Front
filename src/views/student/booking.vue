<template>
  <div class="booking-page">

    <!-- 标题 -->
    <div class="page-header">
      <div class="title">我的预约</div>
      <div class="desc">查看当前预约记录</div>
    </div>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">

      <el-table
        :data="bookingList"
        border
        style="width: 100%"
      >

        <!-- 设备名 -->
        <el-table-column
          prop="deviceName"
          label="设备名"
          align="center"
        />

        <!-- 预约时间 -->
        <el-table-column
          label="预约时间"
          align="center"
        >
          <template slot-scope="scope">
            <div>
              {{ formatTime(scope.row.startTime) }}
            </div>

            <div style="margin-top: 5px;">
              至
            </div>

            <div style="margin-top: 5px;">
              {{ formatTime(scope.row.endTime) }}
            </div>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column
          label="审批状态"
          align="center"
        >
          <template slot-scope="scope">

            <!-- 指导教师审批 -->
            <el-tag
              v-if="scope.row.status === '待指导教师审批'"
              type="warning"
            >
              待指导教师审批
            </el-tag>

            <!-- 管理员审批 -->
            <el-tag
              v-else-if="scope.row.status === '待管理员初审'"
              type="warning"
            >
              待管理员初审
            </el-tag>

            <!-- 已通过 -->
            <el-tag
              v-else-if="
                scope.row.status === '已通过' ||
                scope.row.status === '负责人已通过'
              "
              type="success"
            >
              已通过
            </el-tag>

            <!-- 教师驳回 -->
            <el-tag
              v-else-if="scope.row.status === '教师已驳回'"
              type="danger"
            >
              教师已驳回
            </el-tag>

            <!-- 管理员驳回 -->
            <el-tag
              v-else-if="scope.row.status === '管理员已驳回'"
              type="danger"
            >
              管理员已驳回
            </el-tag>

            <!-- 已撤销 -->
            <el-tag
              v-else-if="scope.row.status === '已撤销'"
              type="info"
            >
              已撤销
            </el-tag>

            <!-- 兜底 -->
            <el-tag v-else type="info">
              {{ scope.row.status || '未知状态' }}
            </el-tag>

          </template>
        </el-table-column>

        <el-table-column
  label="使用状态"
  align="center"
>
  <template slot-scope="scope">
    <el-tag :type="getUseStatusTagType(scope.row)">
      {{ getUseStatus(scope.row) }}
    </el-tag>
  </template>
</el-table-column>

        <!-- 操作 -->
        <el-table-column
          label="操作"
          align="center"
        >
          <template slot-scope="scope">

            <el-button
              v-if="
    (
      scope.row.status === '待指导教师审批' ||
      scope.row.status === '待管理员初审' ||
      scope.row.status === '待负责人审批' ||
      scope.row.status === '待财务缴费' ||
      scope.row.status === '已通过' ||
      scope.row.status === '负责人已通过'
    ) &&
    getUseStatus(scope.row) !== '使用中' &&
    getUseStatus(scope.row) !== '已使用'
  "
              type="danger"
              size="mini"
              round
              @click="cancelBooking(scope.row.id)"
            >
              撤销预约
            </el-button>

            <span v-else style="color:#999;">
              不可操作
            </span>

          </template>
        </el-table-column>

      </el-table>

    </el-card>

  </div>
</template>

<script>
import { getMyBookings, cancelBooking } from '@/api/client'

export default {
  name: 'StudentBooking',

  data() {
    return {
      bookingList: []
    }
  },

  mounted() {
    this.loadBookingList()
  },

  methods: {
    // 加载预约数据
    loadBookingList() {
      getMyBookings().then(res => {
        console.log('我的预约返回：', res)
        this.bookingList = res.data.data || []
      }).catch(err => {
        console.log('我的预约接口错误：', err)
        this.$message.error('预约列表加载失败')
      })
    },

    // 时间格式化
    formatTime(time) {
      if (!time) return ''

      const date = new Date(time)

      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')

      const h = String(date.getHours()).padStart(2, '0')
      const mm = String(date.getMinutes()).padStart(2, '0')

      return `${y}-${m}-${d} ${h}:${mm}`
    },

    // 撤销预约
    cancelBooking(id) {
      this.$confirm('确定要撤销该预约吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        cancelBooking(id).then(res => {
          this.$message.success(res.data.message || '撤销成功')
          this.loadBookingList()
        }).catch(err => {
          this.$message.error(
            err.response?.data?.detail || '撤销失败'
          )
        })
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },

    getUseStatus(row) {
  if (
    row.status !== '已通过' &&
    row.status !== '负责人已通过'
  ) {
    return '未生效'
  }

  const now = new Date().getTime()
  const start = new Date(row.startTime).getTime()
  const end = new Date(row.endTime).getTime()

  if (now < start) {
    return '未开始'
  }

  if (now >= start && now <= end) {
    return '使用中'
  }

  return '已使用'
},

getUseStatusTagType(row) {
  const status = this.getUseStatus(row)

  if (status === '使用中') {
    return 'warning'
  }

  if (status === '已使用') {
    return 'info'
  }

  if (status === '未开始') {
    return 'success'
  }

  return 'info'
}
  }
}
</script>

<style scoped>
.booking-page {
  padding: 30px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 标题 */
.page-header {
  margin-bottom: 20px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.desc {
  margin-top: 6px;
  color: #909399;
}

/* 卡片 */
.table-card {
  border-radius: 14px;
  border: none;
}
</style>