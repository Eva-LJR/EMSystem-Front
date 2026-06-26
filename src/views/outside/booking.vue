<template>
  <div class="booking-page">

    <!-- 标题 -->
    <div class="page-header">
      <div class="title">我的预约</div>
      <div class="desc">查看当前预约记录、缴费状态与撤销申请</div>
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

        <!-- 费用 -->
        <el-table-column
          label="费用"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.totalFee || 0 }} 元</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column
          label="审批状态"
          align="center"
        >
          <template slot-scope="scope">

            <el-tag
              v-if="scope.row.status === '待管理员初审'"
              type="warning"
            >
              待管理员初审
            </el-tag>

            <el-tag
              v-else-if="scope.row.status === '待负责人审批'"
              type="warning"
            >
              待负责人审批
            </el-tag>

            <el-tag
              v-else-if="
                scope.row.status === '待财务缴费' ||
                scope.row.status === '待缴费'
              "
              type="warning"
            >
              待财务缴费
            </el-tag>

            <el-tag
              v-else-if="
                scope.row.statusCode === 'payment_submitted' ||
                scope.row.status === '待管理员确认缴费'
              "
              type="warning"
            >
              待管理员确认缴费
            </el-tag>

            <el-tag
              v-else-if="
                scope.row.status === '已通过' ||
                scope.row.status === '负责人已通过'
              "
              type="success"
            >
              已通过
            </el-tag>

            <el-tag
              v-else-if="
                scope.row.status === '管理员已驳回' ||
                scope.row.status === '负责人已驳回'
              "
              type="danger"
            >
              已驳回
            </el-tag>

            <el-tag
              v-else-if="scope.row.status === '已撤销'"
              type="info"
            >
              已撤销
            </el-tag>

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
  width="240"
>
  <template slot-scope="scope">

    <!-- 待财务缴费：显示去缴费 + 撤销预约 -->
    <div
      v-if="
        scope.row.statusCode === 'pending_payment' ||
        scope.row.status === '待财务缴费' ||
        scope.row.status === '待缴费'
      "
    >
      <el-button
        type="warning"
        size="mini"
        round
        @click="goPay(scope.row)"
      >
        去缴费
      </el-button>

      <el-button
        type="danger"
        size="mini"
        round
        @click="cancelBooking(scope.row.id)"
      >
        撤销预约
      </el-button>
    </div>

    <!-- 已提交缴费，等待管理员确认 -->
    <div
      v-else-if="
        scope.row.statusCode === 'payment_submitted' ||
        scope.row.status === '待管理员确认缴费'
      "
    >
      <el-tag type="warning">
        等待管理员确认
      </el-tag>
    </div>

    <!-- 其他可撤销状态 -->
    <el-button
      v-else-if="
        (
          scope.row.status === '待指导教师审批' ||
          scope.row.status === '待管理员初审' ||
          scope.row.status === '待负责人审批' ||
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

    <el-dialog
  title="模拟财务系统缴费"
  :visible.sync="paymentDialogVisible"
  width="520px"
>
  <el-descriptions :column="1" border>
    <el-descriptions-item label="预约编号">
      {{ currentPayBooking.bookingNo || currentPayBooking.id }}
    </el-descriptions-item>

    <el-descriptions-item label="设备名称">
      {{ currentPayBooking.deviceName }}
    </el-descriptions-item>

    <el-descriptions-item label="应缴金额">
      <span style="color:#E6A23C; font-weight:bold;">
        {{ currentPayBooking.totalFee || 0 }} 元
      </span>
    </el-descriptions-item>

    <el-descriptions-item label="缴费方式">
      模拟学校财务系统线上缴费
    </el-descriptions-item>

    <el-descriptions-item label="说明">
      当前系统未真实接入学校财务平台，此处用于模拟校外人员完成线上缴费。
      缴费提交后，预约将进入“待管理员确认缴费”状态。
    </el-descriptions-item>
  </el-descriptions>

  <div slot="footer">
    <el-button @click="paymentDialogVisible = false">
      取消
    </el-button>

    <el-button
      type="primary"
      @click="confirmMockPayment"
    >
      确认已完成模拟缴费
    </el-button>
  </div>
</el-dialog>

  </div>
</template>

<script>
import { getMyBookings, cancelBooking, payBooking } from '@/api/client'

export default {
  name: 'OutsideBooking',

  data() {
    return {
      bookingList: [],
      paymentDialogVisible: false,
      currentPayBooking: {}
    }
  },

  mounted() {
    this.loadBookingList()
  },

  methods: {
    loadBookingList() {
      getMyBookings().then(res => {
        console.log('校外人员我的预约返回：', res)
        this.bookingList = res.data.data || []
      }).catch(err => {
        console.log('校外人员预约列表错误：', err)
        this.$message.error('预约列表加载失败')
      })
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
      this.$confirm('确定要撤销该预约吗？已缴费预约将按规定退还95%的费用。', '提示', {
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

    goPay(row) {
  this.currentPayBooking = row
  this.paymentDialogVisible = true
},

confirmMockPayment() {
  if (!this.currentPayBooking || !this.currentPayBooking.id) {
    this.$message.error('预约信息不存在')
    return
  }

  payBooking(this.currentPayBooking.id).then(res => {
    this.$message.success(
      res.data.message || '缴费信息已提交，请等待设备管理员确认'
    )
    this.paymentDialogVisible = false
    this.currentPayBooking = {}
    this.loadBookingList()
  }).catch(err => {
    this.$message.error(
      err.response?.data?.detail || '缴费提交失败'
    )
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