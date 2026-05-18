<template>
  <div class="page">

    <!-- 标题 -->
    <div class="header">
      <div class="title">
        学生二级审批单
      </div>
    </div>

    <!-- 列表 -->
    <el-card shadow="never" class="table-card">

      <el-table
        :data="bookingList"
        border
        style="width:100%"
      >

        <!-- 预约编号 -->
        <el-table-column
          label="预约编号"
          align="center"
          width="220"
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
              v-if="scope.row.status === '待管理员审批'"
              type="primary"
              size="mini"
              round
              @click="openDialog(scope.row)"
            >
              查看详情
            </el-button>

            <!-- 已通过 -->
            <el-tag
              v-else-if="scope.row.status === '管理员已通过'"
              type="success"
            >
              已通过
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

      <!-- 返回 -->
      <div class="footer">

        <el-button
          type="primary"
          round
          @click="$router.push('/admin/approval')"
        >
          返回待审批页
        </el-button>

      </div>

    </el-card>

    <!-- ========================= -->
    <!-- 审批详情弹窗 -->
    <!-- ========================= -->

    <el-dialog
      title="学生预约详情审批"
      :visible.sync="dialogVisible"
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
          width="220"
        />

        <el-table-column
          prop="value"
          label="内容"
        />

      </el-table>

      <!-- 底部按钮 -->
      <div
        slot="footer"
        class="dialog-footer"
      >

        <!-- 查看设备状态 -->
        <el-button
          type="warning"
          round
          @click="checkDeviceStatus"
        >
          查看预约时段设备状态
        </el-button>

        <!-- 通过 -->
        <el-button
          type="success"
          round
          @click="approve"
        >
          通过
        </el-button>

        <!-- 驳回 -->
        <el-button
          type="danger"
          round
          @click="reject"
        >
          驳回
        </el-button>

      </div>

    </el-dialog>

  </div>
</template>

<script>
export default {

  name: 'AdminStudentApproval',

  data() {

    return {

      bookingList: [],

      dialogVisible: false,

      currentBooking: null

    }

  },

  mounted() {

    this.loadData()

  },

  computed: {

    detailTable() {

      if (!this.currentBooking) return []

      return [

        {
          label: '申请学生姓名学号',
          value:
            `${this.currentBooking.studentName || '未知'}
             (${this.currentBooking.studentId || '未知'})`
        },

        {
          label: '指导教师',
          value:
            this.currentBooking.teacherName || '暂无'
        },

        {
          label: '所属学院',
          value:
            this.currentBooking.college || '暂无'
        },

        {
          label: '预约设备',
          value:
          this.currentBooking.deviceName
        },

        {
          label: '预约时段',
          value:
            `${this.format(
              this.currentBooking.startTime
            )} 至 ${this.format(
              this.currentBooking.endTime
            )}`
        },

        {
          label: '预约用途',
          value:
          this.currentBooking.reason
        },

        {
          label: '申请时间',
          value:
            this.format(
              this.currentBooking.createTime
            )
        }

      ]

    }

  },

  methods: {

    /* =========================
       加载数据
    ========================= */

    loadData() {

      const all =
        JSON.parse(
          localStorage.getItem('booking_all')
        ) || []

      this.bookingList = all.filter(item => {

        return (
          item.role === 'student' &&
          item.currentStep === 'admin'
        )

      })

    },

    /* =========================
       打开弹窗
    ========================= */

    openDialog(row) {

      this.currentBooking = row

      this.dialogVisible = true

    },

    /* =========================
       查看设备状态
    ========================= */

    checkDeviceStatus() {

      if (!this.currentBooking) return

      const deviceList =
        JSON.parse(
          localStorage.getItem('device_list')
        ) || []

      const device = deviceList.find(
        i => i.model === this.currentBooking.deviceName
      )

      if (!device) {

        this.$message.error('设备不存在')

        return

      }

      this.$alert(

        `当前设备状态：${device.status}`,

        '设备状态',

        {
          confirmButtonText: '确定'
        }

      )

    },

    /* =========================
       审批通过
    ========================= */

    approve() {

      const all =
        JSON.parse(
          localStorage.getItem('booking_all')
        ) || []

      const index =
        all.findIndex(
          i => i.id === this.currentBooking.id
        )

      if (index !== -1) {

        all[index].status = '管理员已通过'

        all[index].currentStep = 'end'

      }

      localStorage.setItem(
        'booking_all',
        JSON.stringify(all)
      )

      this.$message.success('审批通过')

      this.dialogVisible = false

      this.loadData()

    },

    /* =========================
       驳回
    ========================= */

    reject() {

      const all =
        JSON.parse(
          localStorage.getItem('booking_all')
        ) || []

      const index =
        all.findIndex(
          i => i.id === this.currentBooking.id
        )

      if (index !== -1) {

        all[index].status = '管理员已驳回'

        all[index].currentStep = 'end'

      }

      localStorage.setItem(
        'booking_all',
        JSON.stringify(all)
      )

      this.$message.error('审批驳回')

      this.dialogVisible = false

      this.loadData()

    },

    /* =========================
       时间格式化
    ========================= */

    format(time) {

      if (!time) return ''

      const date = new Date(time)

      const y = date.getFullYear()

      const m = String(
        date.getMonth() + 1
      ).padStart(2, '0')

      const d = String(
        date.getDate()
      ).padStart(2, '0')

      const h = String(
        date.getHours()
      ).padStart(2, '0')

      const mm = String(
        date.getMinutes()
      ).padStart(2, '0')

      return `${y}-${m}-${d} ${h}:${mm}`

    }

  }

}
</script>

<style scoped>

.page {
  padding: 30px;
  background: #f5f7fa;
  min-height: 100vh;
}

.header {
  margin-bottom: 20px;
}

.title {
  font-size: 30px;
  font-weight: 700;
  color: #409EFF;
  text-align: center;
}

.table-card {
  border-radius: 16px;
}

.footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

</style>
