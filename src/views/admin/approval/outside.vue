<template>
  <div class="page">

    <!-- 标题 -->
    <div class="header">
      校外人员初审单
    </div>

    <!-- 表格 -->
    <el-card class="table-card">

      <el-table
        :data="bookingList"
        border
        style="width: 100%"
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
              v-if="scope.row.status === '待管理员初审'"
              type="primary"
              size="mini"
              round
              @click="openDialog(scope.row)"
            >
              查看详情
            </el-button>

            <!-- 已通过 -->
            <el-tag
              v-else-if="scope.row.status === '待负责人审批'"
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
    <!-- 详情弹窗 -->
    <!-- ========================= -->

    <el-dialog
      title="校外人员预约详情审批"
      :visible.sync="dialogVisible"
      width="720px"
    >

      <el-table
        :data="detailTable"
        border
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

      <div slot="footer" class="dialog-footer">

        <el-button
          type="warning"
          round
          @click="checkDeviceStatus"
        >
          查看预约时段设备状态
        </el-button>

        <el-button
          type="success"
          round
          @click="approve"
        >
          通过
        </el-button>

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

  name: 'AdminOutsideApproval',

  data() {
    return {

      bookingList: [],
      dialogVisible: false,
      current: null

    }
  },

  mounted() {
    this.loadData()
  },

  computed: {

    detailTable() {

      if (!this.current) return []

      return [

        {
          label: '申请人员姓名编号',
          value: `${this.current.name || '未知'} (${this.current.id || '未知'})`
        },

        {
          label: '所在单位',
          value: this.current.company || '未知'
        },

        {
          label: '预约设备',
          value: this.current.deviceName
        },

        {
          label: '预约时段',
          value: `${this.format(this.current.startTime)} ~ ${this.format(this.current.endTime)}`
        },

        {
          label: '预约用途',
          value: this.current.reason
        },

        {
          label: '申请时间',
          value: this.format(this.current.createTime)
        }

      ]

    }

  },

  methods: {

    /* =====================
       加载数据
    ===================== */

    loadData() {

      const all =
        JSON.parse(localStorage.getItem('booking_all')) || []

      this.bookingList = all.filter(i => {
        return i.role === 'outside' &&
          i.currentStep === 'admin'
      })

    },

    /* =====================
       打开弹窗
    ===================== */

    openDialog(row) {
      this.current = row
      this.dialogVisible = true
    },

    /* =====================
       设备状态查询
    ===================== */

    checkDeviceStatus() {

      const devices =
        JSON.parse(localStorage.getItem('device_list')) || []

      const d = devices.find(
        i => i.model === this.current.deviceName
      )

      if (!d) {
        this.$message.error('设备不存在')
        return
      }

      this.$alert(
        `当前设备状态：${d.status}`,
        '设备状态',
        { confirmButtonText: '确定' }
      )

    },

    /* =====================
       通过
    ===================== */

    approve() {

      const all =
        JSON.parse(localStorage.getItem('booking_all')) || []

      const idx = all.findIndex(i => i.id === this.current.id)

      if (idx !== -1) {
        all[idx].status = '待负责人审批'
        all[idx].currentStep = 'leader'
      }

      localStorage.setItem(
        'booking_all',
        JSON.stringify(all)
      )

      this.$message.success('审批通过')

      this.dialogVisible = false
      this.loadData()

    },

    /* =====================
       驳回
    ===================== */

    reject() {

      const all =
        JSON.parse(localStorage.getItem('booking_all')) || []

      const idx = all.findIndex(i => i.id === this.current.id)

      if (idx !== -1) {
        all[idx].status = '管理员已驳回'
        all[idx].currentStep = 'end'
      }

      localStorage.setItem(
        'booking_all',
        JSON.stringify(all)
      )

      this.$message.error('已驳回')

      this.dialogVisible = false
      this.loadData()

    },

    /* =====================
       时间格式化
    ===================== */

    format(t) {
      if (!t) return ''
      const d = new Date(t)
      return d.toLocaleString()
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
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: #409EFF;
  margin-bottom: 20px;
}

.table-card {
  border-radius: 14px;
}

.footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

</style>
