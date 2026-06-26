<template>
  <div class="page">

    <div class="top-title">
      教师预约单初审
    </div>

    <div class="content">

      <el-card shadow="never">
        <el-table
          v-loading="loading"
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

          <el-table-column label="申请教师" prop="applicant_name" align="center" width="150" />
          <el-table-column label="所属学院" prop="college" align="center" width="180" />
          <el-table-column label="预约设备" prop="device_name" align="center" />

          <el-table-column
            label="状态 / 操作"
            align="center"
            width="200"
          >
            <template slot-scope="scope">
              <div
                v-if="
                  scope.row.statusCode === 'pending_admin' ||
                  scope.row.status === '待管理员初审'
                "
              >
                <el-button
                  type="primary"
                  size="mini"
                  round
                  @click="openDetail(scope.row)"
                >
                  查看详情 / 审批
                </el-button>
              </div>

              <div
                v-else-if="
                  scope.row.statusCode === 'approved' ||
                  scope.row.status === '已通过' ||
                  scope.row.status === '负责人已通过'
                "
              >
                <el-tag type="success">已通过</el-tag>
              </div>

              <div
                v-else-if="
                  scope.row.statusCode === 'rejected' ||
                  scope.row.status === '已驳回' ||
                  (scope.row.status && scope.row.status.includes('驳回'))
                "
              >
                <el-tag type="danger">已驳回</el-tag>
              </div>

              <div
                v-else-if="
                  scope.row.statusCode === 'cancelled' ||
                  scope.row.status === '已撤销'
                "
              >
                <el-tag type="info">已撤销</el-tag>
              </div>

              <div v-else>
                <el-tag type="info">{{ scope.row.status }}</el-tag>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          class="pagination"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />

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
      title="教师预约单详情初审"
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
      detailDialog: false,
      currentBooking: null,

      loading: false,
      page: 1,
      pageSize: 10,
      total: 0
    }
  },
  computed: {
    // 💡 适配真后端返回的真实字段 (snake_case)
    detailTable() {
      if (!this.currentBooking) return []
      return [
        {
          label: '申请教师姓名 (工号)',
          value: `${this.currentBooking.applicant_name || '未知'} (${this.currentBooking.applicant_id || '-'})`
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
          value: this.format(this.currentBooking.created_at, true)
        }
      ]
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    // 💡 连通真后端：同时拉取流转到当前管理员处的教师申请，以及最新的设备库状态
    async loadData() {
  this.loading = true

  try {
    const res = await request({
      url: '/approvals/',
      method: 'get',
      params: {
        role: 'teacher',
        current_step: 'admin',
        include_history: true,
        recent_months: 3,
        page: this.page,
        pageSize: this.pageSize
      }
    })

    const responseData = res.data ? res.data : res

    if (responseData.code === 20000) {
      const result = responseData.data

      if (Array.isArray(result)) {
        this.bookingList = result
        this.total = result.length
      } else {
        this.bookingList = result.items || []
        this.total = result.total || 0
      }
    }
  } catch (error) {
    this.$message.error('获取教师预约单失败')
  } finally {
    this.loading = false
  }
},

    openDetail(row) {
      this.currentBooking = row
      this.detailDialog = true
    },

    // 💡 从真实的后端设备列表查状态，不再看 localStorage 缓存假数据
    
    async checkDeviceStatus() {
  if (!this.currentBooking || !this.currentBooking.id) {
    this.$message.error('预约单信息不存在')
    return
  }

  try {
    const res = await request({
      url: `/approvals/${this.currentBooking.id}/availability`,
      method: 'get'
    })

    const responseData = res.data ? res.data : res

    if (responseData.code !== 20000) {
      this.$message.error(responseData.message || '设备时段校验失败')
      return
    }

    const data = responseData.data
    const device = data.device || {}
    const booking = data.booking || {}
    const conflicts = data.conflicts || []

    let conflictText = ''

    if (conflicts.length > 0) {
      conflictText = conflicts.map(item => {
        return `
          <p>
            预约编号：${item.bookingNo || item.id}<br/>
            申请人：${item.applicantName || '-'}<br/>
            占用时段：${this.format(item.startTime)} 至 ${this.format(item.endTime)}<br/>
            当前状态：${item.status || '-'}
          </p>
        `
      }).join('<hr/>')
    } else {
      conflictText = '<p>无冲突预约</p>'
    }

    this.$alert(
      `
      <div>
        <p><b>校验结果：</b>
          <span style="color:${data.available ? '#67C23A' : '#F56C6C'};">
            ${data.available ? '可用' : '不可用'}
          </span>
        </p>
        <p><b>说明：</b>${data.message}</p>
        <p><b>设备名称：</b>${device.name || device.model || '-'}</p>
        <p><b>设备编号：</b>${device.deviceCode || '-'}</p>
        <p><b>设备当前状态：</b>${device.status || '-'}</p>
        <p><b>申请时段：</b>${this.format(booking.startTime)} 至 ${this.format(booking.endTime)}</p>
        <hr/>
        <p><b>冲突预约：</b></p>
        ${conflictText}
      </div>
      `,
      '预约时段设备可用性校验',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定'
      }
    )
  } catch (error) {
    this.$message.error(
      error.response?.data?.detail || '设备时段校验失败'
    )
  }
},

    // 💡 接入真初审通过接口
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

    // 💡 接入真初审驳回接口
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

    // 时间格式化
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
},

    handlePageChange(page) {
      this.page = page
      this.loadData()
    },

    handleSizeChange(size) {
      this.pageSize = size
      this.page = 1
      this.loadData()
    },
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
.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>