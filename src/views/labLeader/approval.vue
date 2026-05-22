<template>
  <div class="approval-page">

    <div class="page-header">
      <div class="title">校外人员终审</div>
      <div class="desc">处理校外人员预约终审申请</div>
    </div>

    <el-card shadow="never" class="table-card">
      <el-table :data="approvalList" border style="width: 100%">

        <el-table-column label="预约编号" align="center" width="100">
          <template slot-scope="scope">
            {{ scope.row.id }}
          </template>
        </el-table-column>
        
        <el-table-column label="预约设备" prop="device_name" align="center" />
        
        <el-table-column label="申请人" prop="applicant_name" align="center" width="150" />

        <el-table-column label="状态/操作" align="center" width="200">
          <template slot-scope="scope">

            <el-button
              v-if="scope.row.status === '待负责人审批'"
              type="primary"
              size="mini"
              @click="openDetail(scope.row)"
            >
              查看详情 / 审批
            </el-button>

            <el-tag
              v-else-if="scope.row.status === '负责人已通过' || scope.row.status === '待财务缴费'"
              type="success"
            >
              已通过
            </el-tag>

            <el-tag
              v-else-if="scope.row.status.includes('驳回')"
              type="danger"
            >
              已驳回
            </el-tag>

          </template>
        </el-table-column>

      </el-table>
    </el-card>

    <el-dialog
      title="校外人员预约终审"
      :visible.sync="dialogVisible"
      width="650px"
    >
      <el-form label-width="90px" class="detail-form">
        <el-row>
          <el-col :span="12">
            <el-form-item label="申请人员:">
              <b>{{ currentRow.userInfo }}</b>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所在单位:">
              <b>{{ currentRow.company }}</b>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="预约设备:">
              <b>{{ currentRow.deviceName }}</b>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请时间:">
              {{ formatTime(currentRow.createTime) }}
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="预约时段:">
          <el-tag size="medium">{{ formatTime(currentRow.startTime) }}</el-tag>
          <span style="margin: 0 10px; color: #909399;">至</span>
          <el-tag size="medium" type="warning">{{ formatTime(currentRow.endTime) }}</el-tag>
        </el-form-item>

        <el-form-item label="预约用途:">
          <div style="background: #f8f9fa; padding: 10px; border-radius: 4px;">
            {{ currentRow.reason }}
          </div>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="rejectBooking">驳 回</el-button>
        <el-button type="primary" @click="approveBooking">同意并通过</el-button>
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

.table-card {
  border-radius: 14px;
  border: none;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>