<template>
  <div class="device-page">

    <!-- ================= 顶部区域 ================= -->
    <div class="header-card">

      <div class="header-left">

        <div class="page-title">
          实验室设备管理
        </div>

        <div class="page-desc">
          统一管理实验室设备信息与状态
        </div>

      </div>

      <div class="header-right">

        <!-- 搜索 -->
        <el-input
          v-model="searchKeyword"
          placeholder="搜索设备名称"
          prefix-icon="el-icon-search"
          clearable
          class="search-input"
        />

        <!-- 新增 -->
        <el-button
          type="primary"
          icon="el-icon-setting"
          @click="openAddDialog"
        >
          采购录入新设备
        </el-button>

      </div>

    </div>

    <!-- ================= 设备表格 ================= -->
    <el-card shadow="never" class="table-card">

      <el-table
        :data="filterDeviceList"
        border
        style="width: 100%"
      >

        <el-table-column
          prop="id"
          label="设备编号"
          align="center"
          width="180"
        />

        <el-table-column
          prop="model"
          label="设备型号"
          align="center"
        />

        <!-- 状态 -->
        <el-table-column
          label="可用状态"
          align="center"
          width="180"
        >

          <template slot-scope="scope">

            <el-tag
              v-if="scope.row.status === '可预约'"
              type="success"
            >
              可预约
            </el-tag>

            <el-tag
              v-else-if="scope.row.status === '检修中'"
              type="warning"
            >
              检修中
            </el-tag>

            <el-tag
              v-else-if="scope.row.status === '使用中'"
              type="danger"
            >
              使用中
            </el-tag>

            <el-tag
              v-else
              type="info"
            >
              已报废
            </el-tag>

          </template>

        </el-table-column>

        <!-- 操作 -->
        <el-table-column
          label="查看设备详细信息"
          align="center"
          width="220"
        >

          <template slot-scope="scope">

            <el-button
              type="primary"
              size="mini"
              round
              @click="openDetailDialog(scope.row)"
            >
              查看
            </el-button>

          </template>

        </el-table-column>

      </el-table>
      <!-- 底部按钮 -->
      <div class="bottom-btns">

        <el-button
          class="back-btn"
          @click="goLogin"
        >
          返回登录页面
        </el-button>
      </div>
    </el-card>

    <!-- ================= 新增设备弹窗 ================= -->
    <el-dialog
      title="新增设备"
      :visible.sync="addDialogVisible"
      width="700px"
    >

      <el-form
        :model="deviceForm"
        label-width="120px"
      >

        <el-form-item label="设备型号">
          <el-input v-model="deviceForm.model" />
        </el-form-item>

        <el-form-item label="设备编号">
          <el-input v-model="deviceForm.id" />
        </el-form-item>

        <el-form-item label="购入时间">
          <el-date-picker
            v-model="deviceForm.buyTime"
            type="date"
            style="width:100%"
          />
        </el-form-item>

        <el-form-item label="生产厂商">
          <el-input v-model="deviceForm.manufacturer" />
        </el-form-item>

        <el-form-item label="实验用途">
          <el-input
            type="textarea"
            :rows="3"
            v-model="deviceForm.purpose"
          />
        </el-form-item>

        <el-form-item label="租用价格">
          <el-input
            v-model="deviceForm.price"
            type="number"
          />
        </el-form-item>

      </el-form>

      <div slot="footer">

        <el-button @click="addDialogVisible = false">
          返回
        </el-button>

        <el-button
          type="primary"
          @click="submitDevice"
        >
          保存并返回
        </el-button>

      </div>

    </el-dialog>

    <!-- ================= 设备详情弹窗 ================= -->
    <el-dialog
      title="设备详细信息"
      :visible.sync="detailDialogVisible"
      width="720px"
    >

      <el-descriptions
        :column="1"
        border
      >

        <el-descriptions-item label="设备型号">
          {{ currentDevice.model }}
        </el-descriptions-item>

        <el-descriptions-item label="设备编号">
          {{ currentDevice.id }}
        </el-descriptions-item>

        <el-descriptions-item label="购入时间">
          {{ formatDate(currentDevice.buyTime) }}
        </el-descriptions-item>

        <el-descriptions-item label="生产厂商">
          {{ currentDevice.manufacturer }}
        </el-descriptions-item>

        <el-descriptions-item label="实验用途">
          {{ currentDevice.purpose }}
        </el-descriptions-item>

        <el-descriptions-item label="租用价格">
          {{ currentDevice.price }} 元/小时
        </el-descriptions-item>

        <el-descriptions-item label="设备状态">

          <el-tag
            v-if="currentDevice.status === '可预约'"
            type="success"
          >
            可预约
          </el-tag>

          <el-tag
            v-else-if="currentDevice.status === '检修中'"
            type="warning"
          >
            检修中
          </el-tag>

          <el-tag
            v-else-if="currentDevice.status === '使用中'"
            type="danger"
          >
            使用中
          </el-tag>

          <el-tag v-else type="info">
            已报废
          </el-tag>

        </el-descriptions-item>

      </el-descriptions>

      <div
        slot="footer"
        class="dialog-footer"
      >

        <el-button
          type="danger"
          :disabled="currentDevice.status === '已报废'"
          @click="setScrap"
        >
          将设备状态设置为：已报废
        </el-button>

        <el-button
          @click="detailDialogVisible = false"
        >
          返回
        </el-button>

      </div>

    </el-dialog>

  </div>
</template>

<script>

export default {

  name: 'LabLeaderDevice',

  data() {

    return {

      searchKeyword: '',

      deviceList: [],

      addDialogVisible: false,

      detailDialogVisible: false,

      currentDevice: {},

      deviceForm: {

        id: '',
        model: '',
        buyTime: '',
        manufacturer: '',
        purpose: '',
        price: '',
        status: '可预约'

      }

    }
  },

  mounted() {

    this.loadDeviceList()

  },

  computed: {

    filterDeviceList() {

      return this.deviceList.filter(item => {

        return item.model.includes(this.searchKeyword)

      })

    }

  },

  methods: {
    // 返回登录页
    goLogin() {
      this.$router.push('/')
    },
    // ================= 加载设备 =================
    loadDeviceList() {

      this.deviceList =
        JSON.parse(localStorage.getItem('device_list')) || []

    },

    // ================= 新增 =================
    openAddDialog() {

      this.deviceForm = {

        id: '',
        model: '',
        buyTime: '',
        manufacturer: '',
        purpose: '',
        price: '',
        status: '可预约'

      }

      this.addDialogVisible = true

    },

    // ================= 提交新增 =================
    submitDevice() {

      if (
        !this.deviceForm.id ||
        !this.deviceForm.model
      ) {

        this.$message.error('请填写完整信息')
        return
      }

      const exists = this.deviceList.some(
        item => item.id === this.deviceForm.id
      )

      if (exists) {

        this.$message.error('设备编号已存在')
        return
      }

      this.deviceList.push({

        ...this.deviceForm,

        availableTime: ''

      })

      localStorage.setItem(
        'device_list',
        JSON.stringify(this.deviceList)
      )

      this.loadDeviceList()

      this.addDialogVisible = false

      this.$message.success('设备添加成功')

    },

    // ================= 查看详情 =================
    openDetailDialog(row) {

      this.currentDevice = row

      this.detailDialogVisible = true

    },

    // ================= 报废 =================
    setScrap() {

      const index = this.deviceList.findIndex(
        item => item.id === this.currentDevice.id
      )

      if (index !== -1) {

        this.deviceList[index].status = '已报废'

      }

      localStorage.setItem(
        'device_list',
        JSON.stringify(this.deviceList)
      )

      this.loadDeviceList()

      this.detailDialogVisible = false

      this.$message.success('设备状态修改成功')

    },

    // ================= 日期格式化 =================
    formatDate(time) {

      if (!time) return '-'

      return new Date(time).toLocaleDateString()

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

/* 顶部区域 */

.header-card {

  background: white;
  border-radius: 18px;

  padding: 25px;

  margin-bottom: 20px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.page-title {

  font-size: 28px;
  font-weight: 700;

  color: #1e293b;
}

.page-desc {

  margin-top: 8px;

  color: #64748b;
}

.header-right {

  display: flex;
  align-items: center;
  gap: 15px;
}

.search-input {

  width: 280px;
}

/* 表格 */

.table-card {

  border-radius: 18px;
  border: none;
}

</style>
