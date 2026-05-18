<template>
  <div class="stats-page">

    <!-- ================= 顶部统计卡片 ================= -->
    <div class="card-row">

      <!-- 设备总数 -->
      <el-card shadow="hover" class="stat-card">

        <div class="card-content">

          <div class="icon blue">
            <i class="el-icon-setting"></i>
          </div>

          <div class="info">
            <div class="label">设备总数</div>
            <div class="value">
              {{ deviceTotal }}
            </div>
          </div>

        </div>

      </el-card>

      <!-- 用户总数 -->
      <el-card shadow="hover" class="stat-card">

        <div class="card-content">

          <div class="icon green">
            <i class="el-icon-user"></i>
          </div>

          <div class="info">
            <div class="label">用户数</div>
            <div class="value">
              {{ userTotal }}
            </div>
          </div>

        </div>

      </el-card>

      <!-- 预约数 -->
      <el-card shadow="hover" class="stat-card">

        <div class="card-content">

          <div class="icon orange">
            <i class="el-icon-date"></i>
          </div>

          <div class="info">
            <div class="label">预约成功数</div>
            <div class="value">
              {{ bookingTotal }}
            </div>
          </div>

        </div>

      </el-card>

    </div>

    <!-- ================= 图表区域 ================= -->
    <el-card shadow="never" class="chart-card">

      <div class="chart-header">

        <div class="chart-title">
          设备状态分布图
        </div>

        <el-button
          type="primary"
          icon="el-icon-document"
          @click="reportDialog = true"
        >
          查看设备使用报表
        </el-button>

      </div>

      <!-- 图表 -->
      <div
        id="statusChart"
        class="chart-box"
      ></div>

    </el-card>

    <!-- ================= 使用报表弹窗 ================= -->
    <el-dialog
      title="设备使用报表"
      :visible.sync="reportDialog"
      width="850px"
    >

      <!-- 顶部 -->
      <div class="report-top">

        <!-- 搜索 -->
        <el-input
          v-model="searchKeyword"
          placeholder="搜索设备"
          prefix-icon="el-icon-search"
          clearable
          class="search-input"
        />

        <!-- 切换 -->
        <div>

          <el-button
            :type="reportType === 'week' ? 'primary' : ''"
            @click="reportType = 'week'"
          >
            周报表
          </el-button>

          <el-button
            :type="reportType === 'month' ? 'primary' : ''"
            @click="reportType = 'month'"
          >
            月报表
          </el-button>

          <el-button
            :type="reportType === 'year' ? 'primary' : ''"
            @click="reportType = 'year'"
          >
            年报表
          </el-button>

        </div>

      </div>

      <!-- 表格 -->
      <el-table
        :data="filterReportList"
        border
        style="width:100%;margin-top:20px;"
      >

        <el-table-column
          prop="name"
          label="设备名"
          align="center"
        />

        <el-table-column
          prop="count"
          label="使用次数（千次）"
          align="center"
        />

      </el-table>

    </el-dialog>

  </div>
</template>

<script>

import * as echarts from 'echarts'

export default {

  name: 'LabLeaderStats',

  data() {
    return {

      // 数据
      deviceList: [],
      bookingList: [],

      // 弹窗
      reportDialog: false,

      // 搜索
      searchKeyword: '',

      // 报表类型
      reportType: 'week'

    }
  },

  computed: {

    // ================= 设备总数 =================
    deviceTotal() {

      return this.deviceList.length

    },

    // ================= 用户总数 =================
    userTotal() {

      // 学生
      const studentCount = 1

      // 教师
      const teacherCount = 1

      // 校外人员
      const outsideCount = 1

      // 管理员
      const adminCount =
        JSON.parse(localStorage.getItem('admin_staff'))?.length || 0

      // 实验室负责人
      const leaderCount = 1

      return (
        studentCount +
        teacherCount +
        outsideCount +
        adminCount +
        leaderCount
      )

    },

    // ================= 预约成功数 =================
    bookingTotal() {

      return this.bookingList.filter(
        item => item.status === '已通过'
      ).length

    },

    // ================= 状态统计 =================
    statusCount() {

      return {

        available:
        this.deviceList.filter(i => i.status === '可预约').length,

        using:
        this.deviceList.filter(i => i.status === '使用中').length,

        repairing:
        this.deviceList.filter(i => i.status === '检修中').length,

        broken:
        this.deviceList.filter(i => i.status === '已报废').length

      }

    },

    // ================= 使用报表 =================
    filterReportList() {

      const map = {}

      // 统计已通过预约
      this.bookingList
        .filter(i => i.status === '已通过')
        .forEach(item => {

          if (!map[item.deviceName]) {

            map[item.deviceName] = 0

          }

          // 周/月/年倍率模拟
          if (this.reportType === 'week') {

            map[item.deviceName] += 1

          }

          else if (this.reportType === 'month') {

            map[item.deviceName] += 5

          }

          else {

            map[item.deviceName] += 20

          }

        })

      return Object.keys(map)
        .map(key => {

          return {

            name: key,

            count: map[key]

          }

        })
        .filter(item =>
          item.name.includes(this.searchKeyword)
        )

    }

  },

  mounted() {

    this.loadData()

    this.$nextTick(() => {

      this.initChart()

    })

  },

  methods: {

    // ================= 加载数据 =================
    loadData() {

      this.deviceList =
        JSON.parse(localStorage.getItem('device_list')) || []

      this.bookingList =
        JSON.parse(localStorage.getItem('booking_all')) || []

    },

    // ================= 初始化图表 =================
    initChart() {

      const chart =
        echarts.init(document.getElementById('statusChart'))

      chart.setOption({

        tooltip: {},

        xAxis: {

          type: 'category',

          data: [

            '可预约',
            '使用中',
            '检修中',
            '已报废'

          ]

        },

        yAxis: {

          type: 'value'

        },

        series: [

          {

            type: 'bar',

            data: [

              this.statusCount.available,
              this.statusCount.using,
              this.statusCount.repairing,
              this.statusCount.broken

            ],

            barWidth: 60

          }

        ]

      })

    }

  }

}
</script>

<style scoped>

.stats-page {
  padding: 30px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* ================= 卡片 ================= */

.card-row {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.stat-card {
  flex: 1;
  border-radius: 16px;
}

.card-content {
  display: flex;
  align-items: center;
}

.icon {
  width: 70px;
  height: 70px;

  border-radius: 18px;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 30px;
  color: white;

  margin-right: 18px;
}

.blue {
  background: #409EFF;
}

.green {
  background: #67C23A;
}

.orange {
  background: #E6A23C;
}

.label {
  color: #909399;
  font-size: 15px;
}

.value {
  margin-top: 8px;
  font-size: 34px;
  font-weight: bold;
  color: #303133;
}

/* ================= 图表 ================= */

.chart-card {
  border-radius: 16px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 20px;
}

.chart-title {
  font-size: 20px;
  font-weight: bold;
}

.chart-box {
  height: 420px;
}

/* ================= 报表 ================= */

.report-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  width: 280px;
}

</style>
