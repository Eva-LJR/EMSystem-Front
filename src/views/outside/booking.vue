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
          width="220"
        >
          <template slot-scope="scope">

            <!-- 管理员/负责人审批前，可以撤销 -->
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

            <!-- 待缴费：可以缴费，也可以撤销 -->
            <div
              v-else-if="
                scope.row.status === '待财务缴费' ||
                scope.row.status === '待缴费'
              "
            >
              <el-button
                type="warning"
                size="mini"
                round
                @click="payBooking(scope.row.id)"
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

            <!-- 已通过：仍然可以提前 1 天以上撤销，由后端校验 -->
            <el-button
              v-else-if="
                scope.row.status === '已通过' ||
                scope.row.status === '负责人已通过'
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
import { getMyBookings, cancelBooking, payBooking } from '@/api/client'

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

    payBooking(id) {
      this.$confirm('确定已经完成财务缴费吗？', '缴费确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        payBooking(id).then(() => {
          this.$message.success('缴费成功，预约已通过')
          this.loadBookingList()
        }).catch(err => {
          this.$message.error(
            err.response?.data?.detail || '缴费失败'
          )
        })
      }).catch(() => {
        this.$message.info('已取消缴费操作')
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