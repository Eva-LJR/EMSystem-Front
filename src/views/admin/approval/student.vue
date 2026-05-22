<template>
  <div class="page">

    <div class="top-title" style="background: #67C23A;">
      学生预约单初审
    </div>

    <div class="content">

      <el-card shadow="never">
        <el-table
          :data="bookingList"
          border
          style="width:100%"
        >
          <el-table-column
            label="预约编号"
            align="center"
            width="120"
          >
            <template slot-scope="scope">
              {{ scope.row.id }}
            </template>
          </el-table-column>

          <el-table-column label="申请学生" prop="applicant_name" align="center" width="140" />
          <el-table-column label="指导教师" prop="teacher_name" align="center" width="140" />
          <el-table-column label="所属学院" prop="college" align="center" width="160" />
          <el-table-column label="预约设备" prop="device_name" align="center" />

          <el-table-column
            label="状态 / 操作"
            align="center"
            width="200"
          >
            <template slot-scope="scope">
              <div v-if="scope.row.status === '待管理员初审'">
                <el-button
                  type="success"
                  size="mini"
                  round
                  @click="openDetail(scope.row)"
                >
                  查看详情 / 审批
                </el-button>
              </div>

              <div v-else-if="scope.row.status === '待负责人审批' || scope.row.status === '负责人已通过' || scope.row.status === '待财务缴费'">
                <el-tag type="success">初审已通过</el-tag>
              </div>

              <div v-else-if="scope.row.status.includes('驳回')">
                <el-tag type="danger">已驳回</el-tag>
              </div>

              <div v-else>
                <el-tag type="info">{{ scope.row.status }}</el-tag>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <div class="bottom-btn">
        <el-button
          type="primary"
          @click="$router.push('/admin/approval')"
        >
          返回待审批页
        </el-button>
      </div>

    </div>

    <el-dialog
      title="学生预约单详情初审"
      :visible.sync="detailDialog"
      width="700px"
    >
      <el-table
        :data="detailTable"
        border
        style="width:100%"
      >
        <el-table-column
          prop="label"
          label="字段"
          width="200"
        />
        <el-table-column
          prop="value"
          label="内容"
        />
      </el-table>

      <div
        slot="footer"
        style="display:flex;justify-content:space-between"
      >
        <el-button
          type="warning"
          @click="checkDeviceStatus"
        >
          查看预约时段设备实时状态
        </el-button>

        <div>
          <el-button
            type="success"
            @click="approve"
          >
            同意并通过
          </el-button>
          <el-button
            type="danger"
            @click="reject"
          >
            驳回
          </el-button>
        </div>
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
      deviceList: [],
      detailDialog: false,
      currentBooking: null
    }
  },
  computed: {
    detailTable() {
      if (!this.currentBooking) return []
      return [
        {
          label: '申请学生姓名 (学号)',
          value: `${this.currentBooking.applicant_name || '未知'} (${this.currentBooking.applicant_id || '-'})`
        },
        {
          label: '指导教师',
          value: this.currentBooking.teacher_name || '未填写'
        },
        {
          label: '所属学院',
          value: this.currentBooking.college || '未填写'
        },
        {
          label: '预约设备型号',
          value: this.currentBooking.device_name || '-'
        },
        {
          label: '预约时段',
          value: `${this.format(this.currentBooking.start_time)} 至 ${this.format(this.currentBooking.end_time)}`
        },
        {
          label: '预约用途',
          value: this.currentBooking.reason || '-'
        },
        {
          label: '申请发起时间',
          value: this.format(this.currentBooking.created_at)
        }
      ]
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const [appRes, devRes] = await Promise.all([
          request({
            url: '/approvals/',
            method: 'get',
            params: { role: 'student', current_step: 'admin' }
          }),
          request({
            url: '/devices/',
            method: 'get'
          })
        ])

        const resData = appRes.data ? appRes.data : appRes
        if (resData.code === 20000) {
          this.bookingList = resData.data
        }

        const devData = devRes.data ? devRes.data : devRes
        if (devData.code === 20000) {
          this.deviceList = devData.data
        }
      } catch (error) {
        this.$message.error('获取单据或设备数据失败')
      }
    },

    openDetail(row) {
      this.currentBooking = row
      this.detailDialog = true
    },

    checkDeviceStatus() {
      if (!this.currentBooking) return

      const device = this.deviceList.find(item => {
        return item.model === this.currentBooking.device_name
      })

      if (!device) {
        this.$message.error('该预约关联的设备型号在系统库中未找到')
        return
      }

      this.$alert(
        `当前数据库中该设备运行状态为：【${device.status}】`,
        '设备实时状态校验',
        { confirmButtonText: '确定' }
      )
    },

    async approve() {
      try {
        await request({
          url: `/approvals/${this.currentBooking.id}/approve`,
          method: 'put'
        })
        this.$message.success('初审通过')
        this.detailDialog = false
        this.loadData()
      } catch (error) {
        this.$message.error('审批操作失败')
      }
    },

    async reject() {
      try {
        await request({
          url: `/approvals/${this.currentBooking.id}/reject`,
          method: 'put'
        })
        this.$message.error('已驳回该申请')
        this.detailDialog = false
        this.loadData()
      } catch (error) {
        this.$message.error('驳回操作失败')
      }
    },

    format(t) {
      if (!t) return ''
      const date = new Date(t)
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
.page{
  min-height:100vh;
  background:#f5f7fa;
  padding:30px;
}
.top-title{
  width:100%;
  height:60px;
  background:#409EFF;
  color:white;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:24px;
  font-weight:700;
  border-radius:12px;
  margin-bottom:25px;
}
.content{
  background:white;
  padding:25px;
  border-radius:12px;
}
.bottom-btn{
  margin-top:25px;
  display:flex;
  justify-content:flex-end;
}
</style>