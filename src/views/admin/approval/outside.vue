<template>
  <div class="page">
    <div class="header">
      校外人员初审单
    </div>

    <el-card class="table-card">
      <el-table :data="bookingList" border style="width: 100%">
        <el-table-column label="预约编号" align="center" width="100">
          <template slot-scope="scope">
            {{ scope.row.id }}
          </template>
        </el-table-column>

        <el-table-column label="申请人" prop="applicant_name" align="center" width="150" />
        <el-table-column label="单位" prop="company" align="center" />
        <el-table-column label="预约设备" prop="device_name" align="center" />

        <el-table-column label="状态/操作" align="center" width="220">
  <template slot-scope="scope">

    <!-- 设备管理员初审 -->
    <el-button
      v-if="
        scope.row.statusCode === 'pending_admin' ||
        scope.row.status === '待管理员初审'
      "
      type="primary"
      size="mini"
      round
      @click="openDialog(scope.row)"
    >
      查看详情 / 初审
    </el-button>

    <!-- 负责人已通过，但校外人员还没点击去缴费：管理员不能确认 -->
    <el-tag
      v-else-if="
        scope.row.statusCode === 'pending_payment' ||
        scope.row.status === '待财务缴费'
      "
      type="warning"
    >
      待校外人员缴费
    </el-tag>

    <!-- 校外人员已经模拟缴费：管理员才能确认 -->
    <el-button
      v-else-if="
        scope.row.statusCode === 'payment_submitted' ||
        scope.row.status === '待管理员确认缴费'
      "
      type="success"
      size="mini"
      round
      @click="confirmPayment(scope.row)"
    >
      确认缴费
    </el-button>

    <el-tag
      v-else-if="
        scope.row.statusCode === 'pending_leader' ||
        scope.row.status === '待负责人审批'
      "
      type="warning"
    >
      待负责人审批
    </el-tag>

    <el-tag
      v-else-if="
        scope.row.statusCode === 'approved' ||
        scope.row.status === '已通过'
      "
      type="success"
    >
      已通过
    </el-tag>

    <el-tag
      v-else-if="
        scope.row.statusCode === 'rejected' ||
        scope.row.status === '已驳回' ||
        (scope.row.status && scope.row.status.includes('驳回'))
      "
      type="danger"
    >
      已驳回
    </el-tag>

    <el-tag
      v-else-if="
        scope.row.statusCode === 'cancelled' ||
        scope.row.status === '已撤销'
      "
      type="info"
    >
      已撤销
    </el-tag>

    <el-tag v-else type="info">
      {{ scope.row.status || '未知状态' }}
    </el-tag>

  </template>
</el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="预约单初审详情" :visible.sync="detailDialog" width="650px">
      <el-form label-width="90px">
        <el-row>
          <el-col :span="12"><el-form-item label="申请人:"><b>{{ currentBooking.applicant_name }} ({{ currentBooking.applicant_id }})</b></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="所在单位:"><b>{{ currentBooking.company }}</b></el-form-item></el-col>
        </el-row>
        <el-row>
          <el-col :span="12"><el-form-item label="预约设备:"><b>{{ currentBooking.device_name }}</b></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="申请时间:">{{ format(currentBooking.created_at, true) }}</el-form-item></el-col>
        </el-row>
        <el-row>
  <el-col :span="12">
    <el-form-item label="应缴费用:">
      <b style="color:#E6A23C;">{{ currentBooking.total_fee || currentBooking.totalFee || 0 }} 元</b>
    </el-form-item>
  </el-col>
  <el-col :span="12">
    <el-form-item label="缴费状态:">
      <el-tag v-if="currentBooking.is_paid || currentBooking.isPaid" type="success">
        已确认缴费
      </el-tag>
      <el-tag v-else type="warning">
        未确认缴费
      </el-tag>
    </el-form-item>
  </el-col>
</el-row>
        <el-form-item label="预约时段:">
          <el-tag size="medium">{{ format(currentBooking.start_time) }}</el-tag>
          <span style="margin: 0 10px;">至</span>
          <el-tag size="medium" type="warning">{{ format(currentBooking.end_time) }}</el-tag>
        </el-form-item>
        <el-form-item label="申请事由:">
          <div style="background: #f8f9fa; padding: 10px; border-radius: 4px;">{{ currentBooking.reason }}</div>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="reject">驳 回</el-button>
        <el-button type="primary" @click="pass">同意并通过</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  data() {
    return {
      bookingList: [],
      detailDialog: false,
      currentBooking: {}
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    // 💡 接入真后端：只查询流转到“管理员”这里的“校外人员”申请
    async loadData() {
      try {
        const res = await request({
          url: '/approvals/',
          method: 'get',
          params: { role: 'outside'}
        })
        const responseData = res.data ? res.data : res
        if (responseData.code === 20000) {
          this.bookingList = responseData.data
        }
      } catch (error) {
        this.$message.error('获取单据失败')
      }
    },
    openDialog(row) {
      this.currentBooking = row
      this.detailDialog = true
    },
    // 💡 接入真后端：通过接口
    async pass() {
      try {
        await request({
          url: `/approvals/${this.currentBooking.id}/approve`,
          method: 'put'
        })
        this.$message.success('初审通过，已流转至负责人审批')
        this.detailDialog = false
        this.loadData()
      } catch (error) {
        this.$message.error('操作失败')
      }
    },
    // 💡 接入真后端：驳回接口
    async reject() {
      try {
        await request({
          url: `/approvals/${this.currentBooking.id}/reject`,
          method: 'put'
        })
        this.$message.success('已驳回申请')
        this.detailDialog = false
        this.loadData()
      } catch (error) {
        this.$message.error('操作失败')
      }
    },
    async confirmPayment(row) {
  try {
    await this.$confirm(
      `确认该预约已完成缴费吗？应缴金额：${row.total_fee || row.totalFee || 0} 元。确认后预约将正式通过。`,
      '确认缴费',
      {
        confirmButtonText: '确认缴费',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await request({
      url: `/approvals/${row.id}/finance-callback`,
      method: 'post'
    })

    this.$message.success('缴费确认成功，预约已通过')
    this.loadData()
  } catch (error) {
    if (error !== 'cancel') {
      this.$message.error(
        error.response?.data?.detail || '缴费确认失败'
      )
    }
  }
},
    // format(t) {
    //   if (!t) return ''
    //   const date = new Date(t)
    //   const y = date.getFullYear()
    //   const m = String(date.getMonth() + 1).padStart(2, '0')
    //   const d = String(date.getDate()).padStart(2, '0')
    //   const h = String(date.getHours()).padStart(2, '0')
    //   const mm = String(date.getMinutes()).padStart(2, '0')
    //   return `${y}-${m}-${d} ${h}:${mm}`
    // }
    format(t, isUtc = false) {
  if (!t) return ''

  let value = t

  if (isUtc && typeof value === 'string' && !value.endsWith('Z')) {
    value = value + 'Z'
  }

  const date = new Date(value)

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')

  return `${y}-${m}-${d} ${h}:${mm}`
}
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 30px;
}
.header {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 25px;
}
.table-card {
  border-radius: 12px;
}
.detail-form {
  margin-top: -15px;
}
</style>