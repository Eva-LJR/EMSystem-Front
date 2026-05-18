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

            <!-- 教师审批中 -->
            <el-tag
              v-if="scope.row.status === '待教师审批'"
              type="warning"
            >
              待教师审批
            </el-tag>

            <!-- 等管理员 -->
            <el-tag
              v-else-if="scope.row.status === '待管理员审批'"
              type="warning"
            >
              待管理员审批
            </el-tag>

            <!-- 管理员通过 -->
            <el-tag
              v-else-if="scope.row.status === '管理员已通过'"
              type="success"
            >
              已通过
            </el-tag>

            <!-- 管理员驳回 -->
            <el-tag
              v-else-if="scope.row.status === '管理员已驳回'"
              type="danger"
            >
              已驳回
            </el-tag>

            <!-- 教师驳回 -->
            <el-tag
              v-else-if="scope.row.status === '教师已驳回'"
              type="danger"
            >
              教师已驳回
            </el-tag>

            <!-- 撤销 -->
            <el-tag
              v-else-if="scope.row.status === '已撤销'"
              type="info"
            >
              已撤销
            </el-tag>

            <!-- 兜底（防止再空白） -->
            <el-tag v-else type="info">
              {{ scope.row.status || '未知状态' }}
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
                scope.row.status === '待审批' ||
                scope.row.status === '已通过'
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
      const all = JSON.parse(localStorage.getItem('booking_all')) || []
      this.bookingList = all.filter(i => i.role === 'student')
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

      this.$confirm(
        '确定要撤销该预约吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {

          const all =
            JSON.parse(localStorage.getItem('booking_all')) || []

          const index =
            all.findIndex(i => i.id === id)

          if (index !== -1) {
            all[index].status = '已撤销'
            all[index].currentStep = 'end'
          }

          localStorage.setItem(
            'booking_all',
            JSON.stringify(all)
          )

          this.loadBookingList()

          this.$message.success('撤销成功')

        })
        .catch(() => {
          this.$message.info('已取消操作')
        })
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
