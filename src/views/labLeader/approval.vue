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
import request from '@/utils/request'

export default {
  name: 'LabLeaderApproval',
  data() {
    return {
      approvalList: [],
      dialogVisible: false,
      currentRow: {}
    }
  },
  mounted() {
    this.loadApprovalList()
  },
  methods: {
    // ================= 1. 拉取真实终审列表 =================
    async loadApprovalList() {
      try {
        const res = await request({
          url: '/approvals/',
          method: 'get',
          // 💡 精准狙击：只拉取流转到负责人环节（leader）的校外人员单据
          params: { role: 'outside', current_step: 'leader' }
        })
        const responseData = res.data ? res.data : res
        if (responseData.code === 20000) {
          this.approvalList = responseData.data
        }
      } catch (error) {
        this.$message.error('获取列表失败')
      }
    },

    // ================= 打开详情弹窗 =================
    openDetail(row) {
      this.currentRow = {
        ...row,
        // 映射后端的真实字段名
        userInfo: `${row.applicant_name} (${row.applicant_id})`,
        company: row.company || '外部单位',
        deviceName: row.device_name,
        startTime: row.start_time,
        endTime: row.end_time,
        createTime: row.created_at
      }
      this.dialogVisible = true
    },

    // ================= 2. 真实通过接口 =================
    async approveBooking() {
      try {
        await request({ 
          url: `/approvals/${this.currentRow.id}/approve`, 
          method: 'put' 
        })
        this.$message.success('终审通过，已流转至财务待缴费环节')
        this.dialogVisible = false
        this.loadApprovalList() // 刷新列表
      } catch (error) {
        this.$message.error('操作失败')
      }
    },

    // ================= 3. 真实驳回接口 =================
    async rejectBooking() {
      try {
        await request({ 
          url: `/approvals/${this.currentRow.id}/reject`, 
          method: 'put' 
        })
        this.$message.success('已驳回该申请')
        this.dialogVisible = false
        this.loadApprovalList() // 刷新列表
      } catch (error) {
        this.$message.error('操作失败')
      }
    },

    // ================= 时间格式化 =================
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
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
