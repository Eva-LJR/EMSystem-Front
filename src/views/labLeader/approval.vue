<template>
  <div class="approval-page">

    <!-- 标题 -->
    <div class="page-header">

      <div class="title">
        校外人员终审
      </div>

      <div class="desc">
        处理校外人员预约终审申请
      </div>

    </div>

    <!-- 列表 -->
    <el-card shadow="never" class="table-card">

      <el-table
        :data="approvalList"
        border
        style="width: 100%"
      >

        <!-- 预约编号 -->
        <el-table-column
          label="预约编号"
          align="center"
        >

          <template slot-scope="scope">
            {{ scope.row.id }}
          </template>

        </el-table-column>

        <!-- 操作 -->
        <el-table-column
          label="操作"
          align="center"
        >

          <template slot-scope="scope">

            <!-- 待审批 -->
            <el-button
              v-if="scope.row.status === STATUS.OUTSIDE_SECOND"
              type="primary"
              size="mini"
              @click="openDetail(scope.row)"
            >
              查看详情
            </el-button>

            <!-- 已通过 -->
            <el-tag
              v-else-if="scope.row.status === STATUS.APPROVED"
              type="success"
            >
              预约成功
            </el-tag>

            <!-- 已驳回 -->
            <el-tag
              v-else
              type="danger"
            >
              已驳回
            </el-tag>

          </template>

        </el-table-column>

      </el-table>

    </el-card>

    <!-- ================= 详情弹窗 ================= -->
    <el-dialog
      title="校外人员预约终审"
      :visible.sync="dialogVisible"
      width="700px"
    >

      <el-descriptions
        :column="2"
        border
      >

        <el-descriptions-item label="申请人员姓名编号">
          {{ currentRow.userInfo }}
        </el-descriptions-item>

        <el-descriptions-item label="所在单位">
          {{ currentRow.company }}
        </el-descriptions-item>

        <el-descriptions-item label="预约设备">
          {{ currentRow.deviceName }}
        </el-descriptions-item>

        <el-descriptions-item label="预约时段">
          {{ formatTime(currentRow.startTime) }}
          至
          {{ formatTime(currentRow.endTime) }}
        </el-descriptions-item>

        <el-descriptions-item label="预约用途">
          {{ currentRow.reason }}
        </el-descriptions-item>

        <el-descriptions-item label="申请时间">
          {{ formatTime(currentRow.createTime) }}
        </el-descriptions-item>

      </el-descriptions>

      <!-- 底部按钮 -->
      <div
        slot="footer"
        class="dialog-footer"
      >

        <el-button
          type="danger"
          @click="rejectBooking"
        >
          驳回
        </el-button>

        <el-button
          type="primary"
          @click="approveBooking"
        >
          通过
        </el-button>

      </div>

    </el-dialog>

  </div>
</template>

<script>

const STATUS = {

  // 管理员审批
  OUTSIDE_APPLY: '待管理员初审',

  // 负责人审批
  OUTSIDE_SECOND: '待负责人审批',

  // 待缴费
  WAIT_PAY: '待缴费',

  // 已通过
  APPROVED: '已通过',

  // 已驳回
  REJECTED: '已驳回'

}

export default {

  name: 'LabLeaderApproval',

  data() {

    return {

      STATUS,

      approvalList: [],

      dialogVisible: false,

      currentRow: {}

    }

  },

  mounted() {

    this.loadApprovalList()

  },

  methods: {

    // 加载终审列表
    loadApprovalList() {

      const all =
        JSON.parse(localStorage.getItem('booking_all')) || []

      this.approvalList = all.filter(item => {

        return (
          (item.role || '').toLowerCase() === 'outside'
          &&
          (
            item.status === STATUS.OUTSIDE_SECOND
            ||
            item.status === STATUS.APPROVED
            ||
            item.status === STATUS.REJECTED
          )
        )

      })

    },

    // 打开详情
    openDetail(row) {

      this.currentRow = {

        ...row,

        userInfo:
          `${row.userName || '校外人员'} (${row.userId || row.id})`,

        company:
          row.company || '外部单位'

      }

      this.dialogVisible = true

    },

    // 通过
    approveBooking() {

      const all =
        JSON.parse(localStorage.getItem('booking_all')) || []

      const index =
        all.findIndex(i => i.id === this.currentRow.id)

      if (index !== -1) {

        // 负责人审批通过
        // 进入待缴费状态

        all[index].status = STATUS.WAIT_PAY

        all[index].currentStep = 'pay'

      }

      localStorage.setItem(
        'booking_all',
        JSON.stringify(all)
      )

      this.$message.success('终审通过，请用户缴费')

      this.dialogVisible = false

      this.loadApprovalList()

    },

    // 驳回
    rejectBooking() {

      const all =
        JSON.parse(localStorage.getItem('booking_all')) || []

      const index =
        all.findIndex(i => i.id === this.currentRow.id)

      if (index !== -1) {

        all[index].status = STATUS.REJECTED

      }

      localStorage.setItem(
        'booking_all',
        JSON.stringify(all)
      )

      this.$message.success('已驳回')

      this.dialogVisible = false

      this.loadApprovalList()

    },

    // 时间格式化
    formatTime(time) {

      if (!time) return ''

      const date = new Date(time)

      const y = date.getFullYear()

      const m =
        String(date.getMonth() + 1).padStart(2, '0')

      const d =
        String(date.getDate()).padStart(2, '0')

      const h =
        String(date.getHours()).padStart(2, '0')

      const mm =
        String(date.getMinutes()).padStart(2, '0')

      return `${y}-${m}-${d} ${h}:${mm}`

    }

  }

}
</script>

<style scoped>

.approval-page {

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
  color: #1e3a8a;

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

/* 底部按钮 */

.dialog-footer {

  display: flex;
  justify-content: flex-end;
  gap: 10px;

}

</style>
