<template>
  <div class="page">

    <!-- 标题 -->
    <div class="top-title">
      教师预约单
    </div>

    <div class="content">

      <!-- 预约列表 -->
      <el-card>

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
              <div
                v-if="scope.row.status === '待管理员审批'"
              >

                <el-button
                  type="primary"
                  size="mini"
                  @click="openDetail(scope.row)"
                >
                  查看详情
                </el-button>

              </div>

              <!-- 已通过 -->
              <div
                v-else-if="
                  scope.row.status === '管理员已通过'
                "
              >

                <el-tag type="success">
                  已通过
                </el-tag>

              </div>

              <!-- 已驳回 -->
              <div v-else>

                <el-tag type="danger">
                  已驳回
                </el-tag>

              </div>

            </template>

          </el-table-column>

        </el-table>

      </el-card>

      <!-- 底部按钮 -->
      <div class="bottom-btn">

        <el-button
          type="primary"
          @click="$router.push('/admin/approval')"
        >
          返回待审批页
        </el-button>

      </div>

    </div>

    <!-- ========================= -->
    <!-- 预约详情弹窗 -->
    <!-- ========================= -->

    <el-dialog
      title="预约详情审批"
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

      <!-- 底部按钮 -->
      <div
        slot="footer"
        style="display:flex;justify-content:space-between"
      >

        <!-- 查看设备状态 -->
        <el-button
          type="warning"
          @click="checkDeviceStatus"
        >
          查看预约时段设备状态
        </el-button>

        <div>

          <el-button
            type="success"
            @click="approve"
          >
            通过
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

export default {

  data() {

    return {

      bookingList: [],

      detailDialog: false,

      currentBooking: null

    }

  },

  computed: {

    detailTable() {

      if (!this.currentBooking) return []

      return [

        {
          label: '申请教师姓名编号',
          value:
            this.currentBooking.teacherName ||
            '教师001'
        },

        {
          label: '所属学院',
          value:
            this.currentBooking.college ||
            '计算机学院'
        },

        {
          label: '预约设备',
          value:
          this.currentBooking.deviceName
        },

        {
          label: '预约时段',
          value:
            this.format(this.currentBooking.startTime)
            +
            ' 至 '
            +
            this.format(this.currentBooking.endTime)
        },

        {
          label: '预约用途',
          value:
          this.currentBooking.reason
        },

        {
          label: '申请时间',
          value:
            this.format(this.currentBooking.createTime)
        }

      ]

    }

  },

  mounted() {

    this.loadData()

  },

  methods: {

    /* =========================
       加载数据
    ========================= */

    loadData() {

      const all =
        JSON.parse(localStorage.getItem('booking_all'))
        || []

      this.bookingList = all.filter(item => {

        return item.role === 'teacher'

      })

    },

    /* =========================
       打开详情
    ========================= */

    openDetail(row) {

      this.currentBooking = row

      this.detailDialog = true

    },

    /* =========================
       查看设备状态
    ========================= */

    checkDeviceStatus() {

      const deviceList =
        JSON.parse(localStorage.getItem('device_list'))
        || []

      const device =
        deviceList.find(item => {

          return item.model ===
            this.currentBooking.deviceName

        })

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

      const list =
        JSON.parse(localStorage.getItem('booking_all'))
        || []

      const index =
        list.findIndex(item => {

          return item.id ===
            this.currentBooking.id

        })

      if (index !== -1) {

        list[index].status =
          '管理员已通过'

        list[index].currentStep =
          'end'

      }

      localStorage.setItem(
        'booking_all',
        JSON.stringify(list)
      )

      this.$message.success('审批通过')

      this.detailDialog = false

      this.loadData()

    },

    /* =========================
       审批驳回
    ========================= */

    reject() {

      const list =
        JSON.parse(localStorage.getItem('booking_all'))
        || []

      const index =
        list.findIndex(item => {

          return item.id ===
            this.currentBooking.id

        })

      if (index !== -1) {

        list[index].status =
          '管理员已驳回'

        list[index].currentStep =
          'end'

      }

      localStorage.setItem(
        'booking_all',
        JSON.stringify(list)
      )

      this.$message.error('审批驳回')

      this.detailDialog = false

      this.loadData()

    },

    /* =========================
       时间格式化
    ========================= */

    format(t) {

      if (!t) return ''

      return new Date(t)
        .toLocaleString()

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
