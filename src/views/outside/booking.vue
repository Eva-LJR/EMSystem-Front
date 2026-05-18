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

            <el-tag v-if="scope.row.status === '待管理员初审'" type="warning">
              待管理员审批
            </el-tag>

            <el-tag v-else-if="scope.row.status === '待负责人审批'" type="warning">
              待负责人审批
            </el-tag>

            <el-tag
              v-else-if="scope.row.status === '待缴费'"
              type="warning"
            >
              待缴费
            </el-tag>
            <el-tag v-else-if="scope.row.status === '已通过'" type="success">
              已通过
            </el-tag>

            <el-tag v-else-if="scope.row.status === '已驳回'" type="danger">
              已驳回
            </el-tag>
            <el-tag
              v-if="scope.row.status === '使用完成'"
              type=""
            >
              使用完成
            </el-tag>

          </template>

        </el-table-column>

        <!-- 操作 -->
        <el-table-column
          label="操作"
          align="center"
        >

          <template slot-scope="scope">

            <!-- 可撤销 -->
            <el-button
              v-if="
    scope.row.status === '待管理员初审' ||
    scope.row.status === '待负责人审批'
  "
              type="danger"
              size="mini"
              round
              @click="cancelBooking(scope.row.id)"
            >
              撤销预约
            </el-button>

            <!-- 去缴费 -->
            <el-button
              v-else-if="scope.row.status === '待缴费'"
              type="warning"
              size="mini"
              round
              @click="payBooking(scope.row.id)"
            >
              去缴费
            </el-button>

            <!-- 不可操作 -->
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

  name: 'OutsideBooking',

  data() {
    return {
      bookingList: []
    }
  },

  mounted() {
    this.loadBookingList()
  },

  methods: {

    loadBookingList() {
      const all = JSON.parse(localStorage.getItem('booking_all')) || []

      this.bookingList = all.filter(i =>
        (i.role || '').toLowerCase() === 'outside'
      )
    },

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

    cancelBooking(id) {
      const all = JSON.parse(localStorage.getItem('booking_all')) || []

      const updated = all.filter(i => i.id !== id)

      localStorage.setItem('booking_all', JSON.stringify(updated))

      this.bookingList = this.bookingList.filter(i => i.id !== id)

      this.$message.success('撤销成功')
    },
    // 缴费
    payBooking(id) {

      const all =
        JSON.parse(localStorage.getItem('booking_all')) || []

      const index =
        all.findIndex(i => i.id === id)

      if (index !== -1) {

        all[index].status = '已通过'

        all[index].currentStep = 'end'

      }

      localStorage.setItem(
        'booking_all',
        JSON.stringify(all)
      )

      this.$message.success('缴费成功')

      this.loadBookingList()

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
