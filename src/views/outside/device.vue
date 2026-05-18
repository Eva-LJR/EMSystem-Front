<template>
  <div class="device-page">



    <!-- 设备表 -->
    <el-card shadow="never" class="table-card">

      <el-table :data="filterDeviceList" border>

        <el-table-column prop="model" label="设备名" align="center" />

        <el-table-column prop="purpose" label="简介" align="center" />

        <el-table-column prop="price" label="租用价格/小时" align="center" />

        <el-table-column label="操作" align="center">

          <template slot-scope="scope">

            <el-button
              v-if="scope.row.status === '可预约'"
              type="primary"
              size="mini"
              @click="openBookingDialog(scope.row)"
            >
              立即预约
            </el-button>

            <el-button
              v-else
              type="info"
              size="mini"
              disabled
            >
              不可预约
            </el-button>

          </template>

        </el-table-column>

      </el-table>

    </el-card>

    <!-- ================= 预约弹窗 ================= -->
    <el-dialog
      title="预约申请"
      :visible.sync="dialogVisible"
      width="520px"
    >

      <el-form label-width="110px">

        <el-form-item label="设备">
          <el-input v-model="bookingForm.deviceName" disabled />
        </el-form-item>

        <el-form-item label="预约时段">
          <el-date-picker
            v-model="bookingForm.time"
            type="datetimerange"
            style="width:100%"
          />
        </el-form-item>

        <el-form-item label="用途">
          <el-input type="textarea" v-model="bookingForm.reason" />
        </el-form-item>

      </el-form>

      <div slot="footer">

        <el-button @click="dialogVisible = false">
          取消
        </el-button>

        <el-button
          type="primary"
          @click="confirmBooking"
        >
          提交预约申请
        </el-button>

      </div>

    </el-dialog>



  </div>
</template>

<script>
export default {
  name: 'OutsideDevice',

  data() {
    return {

      dialogVisible: false,


      bookingForm: {
        deviceName: '',
        time: '',
        reason: ''
      },

      currentDevice: null,

      deviceList: []
    }
  },
  mounted() {

    this.loadDeviceList()

  },
  computed: {

    filterDeviceList() {
      return this.deviceList
    },

    currentPrice() {
      return this.currentDevice ? this.currentDevice.price : 0
    },

    hours() {
      if (!this.bookingForm.time) return 0

      const start = new Date(this.bookingForm.time[0]).getTime()
      const end = new Date(this.bookingForm.time[1]).getTime()

      return ((end - start) / 3600000).toFixed(2)
    },

    total() {
      return (this.currentPrice * this.hours).toFixed(2)
    }
  },

  methods: {
    // 加载全局设备
    loadDeviceList() {

      const list =
        JSON.parse(localStorage.getItem('device_list')) || []

      this.deviceList = list

    },
    openBookingDialog(row) {
      this.currentDevice = row

      this.bookingForm = {
        deviceName: row.model,
        time: '',
        reason: ''
      }

      this.dialogVisible = true
    },


    confirmBooking() {

      const storageKey = 'booking_all'

      const list = JSON.parse(localStorage.getItem(storageKey)) || []

      const start = new Date(this.bookingForm.time[0]).getTime()
      const end = new Date(this.bookingForm.time[1]).getTime()

      const conflict = list.some(item => {

        if (item.deviceName !== this.bookingForm.deviceName) return false

        const s = new Date(item.startTime).getTime()
        const e = new Date(item.endTime).getTime()

        return start < e && end > s
      })

      if (conflict) {
        this.$message.error('时间冲突')
        return
      }

      list.push({
        id: Date.now(),

        // ✅统一小写
        role: 'outside',

        deviceName: this.bookingForm.deviceName,
        startTime: this.bookingForm.time[0],
        endTime: this.bookingForm.time[1],
        reason: this.bookingForm.reason,

        // ✅审批流必须统一
        status: '待管理员初审',
        currentStep: 'admin',

        createTime: new Date().getTime(),
        totalFee: this.total
      })

      localStorage.setItem(storageKey, JSON.stringify(list))

      this.$message.success('预约已提交')
      this.dialogVisible = false

      this.$router.push('/outside/booking')
    }
  }
}
</script>

<style scoped>

.device-page {
  padding: 30px;
  background: #f5f7fa;
  min-height: 100vh;
}

.table-card {
  margin-top: 20px;
}

.fee-title {
  text-align: center;
  font-size: 18px;
  margin-bottom: 10px;
}

.fee-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.fee-table th,
.fee-table td {
  border: 1px solid #ddd;
  padding: 10px;
  background: #fff;
}

.fee-table th {
  background: #409EFF;
  color: white;
}

</style>
