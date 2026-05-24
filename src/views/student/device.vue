<template>
  <div class="device-page">

    <!-- 页面标题 -->
    <div class="page-header">
      <div class="title">设备列表</div>
      <div class="desc">查看并预约实验设备</div>
    </div>

    <!-- 搜索区域 -->
    <el-card shadow="never" class="filter-card">

      <div class="filter-bar">

        <!-- 搜索 -->
        <el-input
          v-model="searchKeyword"
          placeholder="请输入设备名称"
          prefix-icon="el-icon-search"
          class="search-input"
          @input="loadDeviceList"
        />

        <!-- 时间选择 -->
        <el-date-picker
          v-model="bookingTime"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          class="time-picker"
        />

      </div>

    </el-card>

    <!-- 表格 -->
    <el-card shadow="never" class="table-card">

      <el-table
        :data="filterDeviceList"
        border
        style="width: 100%"
      >

        <el-table-column prop="model" label="设备名" align="center" />

        <el-table-column label="状态" align="center">
          <template slot-scope="scope">

            <el-tag
              v-if="scope.row.status === '可预约'"
              type="success"
            >
              可预约
            </el-tag>

            <el-tag
              v-else-if="scope.row.status === '使用中'"
              type="warning"
            >
              使用中
            </el-tag>

            <el-tag
              v-else-if="scope.row.status === '检修中'"
              type="danger"
            >
              检修中
            </el-tag>

            <el-tag
              v-else
              type="info"
            >
              已报废
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="purpose" label="简介" align="center" />
        <el-table-column prop="price" label="租用价格" align="center" />

        <!-- 预约 -->
        <el-table-column label="预约" align="center">

          <template slot-scope="scope">

            <el-button
              v-if="scope.row.status === '可预约'"
              type="primary"
              size="mini"
              round
              @click="openBookingDialog(scope.row)"
            >
              立即预约
            </el-button>

            <el-button
              v-else
              type="info"
              size="mini"
              disabled
              round
            >
              不可预约
            </el-button>

          </template>

        </el-table-column>

      </el-table>

    </el-card>

    <!-- 预约弹窗 -->
    <el-dialog
      title="预约申请"
      :visible.sync="dialogVisible"
      width="520px"
    >

      <el-form :model="bookingForm" label-width="110px">

        <el-form-item label="设备信息">
          <el-input v-model="bookingForm.deviceName" disabled />
        </el-form-item>

        <el-form-item label="预约时段">
          <el-date-picker
            v-model="bookingForm.time"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="预约用途">
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请输入设备用途"
            v-model="bookingForm.reason"
          />
        </el-form-item>

      </el-form>

      <div slot="footer">

        <el-button round @click="dialogVisible = false">
          返回设备列表
        </el-button>

        <el-button
          type="primary"
          round
          @click="submitBooking"
        >
          提交预约申请
        </el-button>

      </div>

    </el-dialog>

  </div>
</template>

<script>
import { getClientDevices, createBooking } from '@/api/client'
export default {

  name: 'StudentDevice',

  data() {
    return {
      searchKeyword: '',
      bookingTime: '',
      dialogVisible: false,
      currentDevice: null,

      bookingForm: {
        deviceName: '',
        time: '',
        reason: ''
      },

      deviceList: []
    }
  },
  mounted() {

    this.loadDeviceList()

  },
  computed: {
    filterDeviceList() {
      return this.deviceList.filter(item =>
        item.model.includes(this.searchKeyword)
      )
    }
  },

  methods: {
    // 加载全局设备
    // loadDeviceList() {

    //   const list =
    //     JSON.parse(localStorage.getItem('device_list')) || []

    //   this.deviceList = list

    // },
    // loadDeviceList() {
    //   getClientDevices({
    //     keyword: this.searchKeyword
    //     }).then(res => {
    //       this.deviceList = res.data
    //       })
    // },
    formatDateTime(date) {
  const d = new Date(date)

  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')

  return `${y}-${m}-${day}T${h}:${min}:${s}`
},
loadDeviceList() {
  getClientDevices({
    keyword: this.searchKeyword
  }).then(res => {
    console.log('设备接口返回：', res)

    this.deviceList = res.data.data
  }).catch(err => {
    console.log('设备接口错误：', err)
    this.$message.error('设备列表加载失败')
  })
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

    submitBooking() {
  if (!this.bookingForm.time) {
    this.$message.error('请选择预约时间')
    return
  }

  if (!this.bookingForm.reason) {
    this.$message.error('请输入预约用途')
    return
  }

  createBooking({
    device_id: this.currentDevice.id,
    device_name: this.currentDevice.model,
    start_time: this.formatDateTime(this.bookingForm.time[0]),
    end_time: this.formatDateTime(this.bookingForm.time[1]),
    reason: this.bookingForm.reason
  }).then(() => {
    this.$message.success('预约申请提交成功')
    this.dialogVisible = false
    this.$router.push('/student/booking')
  }).catch(err => {
    this.$message.error(
      err.response?.data?.detail || '预约提交失败'
    )
  })
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

.page-header {
  margin-bottom: 20px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.desc {
  margin-top: 6px;
  color: #909399;
}

.filter-card,
.table-card {
  border-radius: 14px;
  border: none;
  margin-bottom: 20px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.search-input {
  width: 300px;
}

.time-picker {
  width: 420px;
}
</style>
