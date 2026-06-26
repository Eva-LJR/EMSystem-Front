<template>
  <div class="stats-page">

    <!-- ================= 顶部统计卡片 ================= -->
    <div class="card-row">

      <el-card shadow="hover" class="stat-card">
        <div class="card-content">
          <div class="icon blue">
            <i class="el-icon-setting"></i>
          </div>

          <div class="info">
            <div class="label">设备总数</div>
            <div class="value">{{ summary.deviceTotal }}</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="card-content">
          <div class="icon green">
            <i class="el-icon-user"></i>
          </div>

          <div class="info">
            <div class="label">用户数</div>
            <div class="value">{{ summary.userTotal }}</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="card-content">
          <div class="icon orange">
            <i class="el-icon-date"></i>
          </div>

          <div class="info">
            <div class="label">预约成功数</div>
            <div class="value">{{ summary.bookingSuccessTotal }}</div>
          </div>
        </div>
      </el-card>

    </div>

    <!-- ================= 图表区域 ================= -->
    <el-card shadow="never" class="chart-card">

      <div class="chart-header">
        <div class="chart-title">设备状态分布图</div>

        <el-button
          type="primary"
          icon="el-icon-document"
          @click="openReportDialog"
        >
          查看设备使用报表
        </el-button>
      </div>

      <div
        ref="statusChart"
        class="chart-box"
      ></div>

    </el-card>

    <!-- ================= 使用报表弹窗 ================= -->
    <el-dialog
      title="设备使用报表"
      :visible.sync="reportDialog"
      width="900px"
    >

      <div class="report-top">

        <el-input
          v-model="searchKeyword"
          placeholder="搜索设备"
          prefix-icon="el-icon-search"
          clearable
          class="search-input"
        />

        <div>
          <el-button
            :type="reportType === 'week' ? 'primary' : ''"
            @click="changeReportType('week')"
          >
            周报表
          </el-button>

          <el-button
            :type="reportType === 'month' ? 'primary' : ''"
            @click="changeReportType('month')"
          >
            月报表
          </el-button>

          <el-button
            :type="reportType === 'year' ? 'primary' : ''"
            @click="changeReportType('year')"
          >
            年报表
          </el-button>
        </div>

      </div>

      <div class="report-summary">
        <span>统计周期：{{ reportTypeText }}</span>
        <span>成功预约次数：{{ reportTotalRecords }} 次</span>
        <span>校外收费合计：{{ reportTotalRevenue }} 元</span>
      </div>

      <el-table
        v-loading="reportLoading"
        :data="filterReportList"
        border
        style="width:100%;margin-top:20px;"
      >
        <el-table-column
          prop="device_name"
          label="设备名称"
          align="center"
        />

        <el-table-column
          prop="use_count"
          label="使用次数（次）"
          align="center"
        />

        <el-table-column
          prop="revenue"
          label="收费金额（元）"
          align="center"
        />
      </el-table>

    </el-dialog>

  </div>
</template>

<script>
import * as echarts from 'echarts'
import request from '@/utils/request'

export default {
  name: 'LabLeaderStats',

  data() {
    return {
      summary: {
        deviceTotal: 0,
        userTotal: 0,
        bookingSuccessTotal: 0,
        deviceStatus: []
      },

      chartInstance: null,

      reportDialog: false,
      reportType: 'week',
      searchKeyword: '',
      reportList: [],
      reportTotalRecords: 0,
      reportTotalRevenue: 0,
      reportLoading: false
    }
  },

  computed: {
    reportTypeText() {
      if (this.reportType === 'week') return '近 7 天'
      if (this.reportType === 'year') return '近 1 年'
      return '近 30 天'
    },

    filterReportList() {
      const keyword = this.searchKeyword.trim()

      if (!keyword) {
        return this.reportList
      }

      return this.reportList.filter(item =>
        item.device_name &&
        item.device_name.includes(keyword)
      )
    }
  },

  mounted() {
    this.loadSummary()
    window.addEventListener('resize', this.resizeChart)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)

    if (this.chartInstance) {
      this.chartInstance.dispose()
      this.chartInstance = null
    }
  },

  methods: {
    async loadSummary() {
      try {
        const res = await request({
          url: '/stats/summary',
          method: 'get'
        })

        const responseData = res.data ? res.data : res

        if (responseData.code === 20000) {
          this.summary = responseData.data

          this.$nextTick(() => {
            this.initChart()
          })
        } else {
          this.$message.error(responseData.message || '统计数据加载失败')
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
        this.$message.error('统计数据加载失败')
      }
    },

    initChart() {
      const chartDom = this.$refs.statusChart

      if (!chartDom) return

      if (!this.chartInstance) {
        this.chartInstance = echarts.init(chartDom)
      }

      const chartData = this.summary.deviceStatus || []

      this.chartInstance.setOption({
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: chartData.map(item => item.name)
        },
        yAxis: {
          type: 'value',
          minInterval: 1
        },
        series: [
          {
            name: '设备数量',
            type: 'bar',
            data: chartData.map(item => item.value),
            barWidth: 60,
            itemStyle: {
              color: function(params) {
                const colorList = ['#67C23A', '#409EFF', '#E6A23C', '#F56C6C', '#909399']
                return colorList[params.dataIndex]
              }
            }
          }
        ]
      })
    },

    resizeChart() {
      if (this.chartInstance) {
        this.chartInstance.resize()
      }
    },

    openReportDialog() {
      this.reportDialog = true
      this.loadReport()
    },

    changeReportType(type) {
      this.reportType = type
      this.loadReport()
    },

    async loadReport() {
      this.reportLoading = true

      try {
        const res = await request({
          url: '/stats/report',
          method: 'get',
          params: {
            range_type: this.reportType
          }
        })

        const responseData = res.data ? res.data : res

        if (responseData.code === 20000) {
          const data = responseData.data || {}

          this.reportList = data.device_ranking || []
          this.reportTotalRecords = data.total_records || 0
          this.reportTotalRevenue = data.total_revenue || 0
        } else {
          this.$message.error(responseData.message || '报表加载失败')
        }
      } catch (error) {
        console.error('加载设备使用报表失败:', error)
        this.$message.error('设备使用报表加载失败')
      } finally {
        this.reportLoading = false
      }
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

.report-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
  width: 280px;
}

.report-summary {
  margin-top: 20px;
  display: flex;
  gap: 30px;
  font-size: 14px;
  color: #606266;
}
</style>