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

        <!-- <el-form-item label="设备编号">
          <el-input v-model="deviceForm.id" />
        </el-form-item> -->

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
// 引入封装好的网络请求工具
import request from '@/utils/request'

export default {
  name: 'LabLeaderDevice',
  data() {
    return {
      searchKeyword: '',
      deviceList: [],
      addDialogVisible: false,
      detailDialogVisible: false,
      currentDevice: {},
      
      // 表单字段完全对齐后端 schemas.py 的 DeviceBase
      deviceForm: {
        model: '',
        buy_time: '',
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
    // 前端模糊搜索过滤
    filterDeviceList() {
      return this.deviceList.filter(item => {
        return item.model && item.model.includes(this.searchKeyword)
      })
    }
  },

  methods: {
    // 返回登录页
    goLogin() {
      this.$router.push('/')
    },

    // ================= 1. 加载设备列表 (连通后端) =================
    async loadDeviceList() {
      try {
        const res = await request({
          url: '/devices/',
          method: 'get'
        })
        const responseData = res.data ? res.data : res
        if (responseData.code === 20000) {
          this.deviceList = responseData.data
        } else {
          this.$message.error('获取设备列表失败')
        }
      } catch (error) {
        console.error('加载设备异常:', error)
      }
    },

    // ================= 打开新增弹窗 =================
    openAddDialog() {
      // 初始化表单，注意不需要手动填 ID，后端 SQLite 会自动生成唯一 ID
      this.deviceForm = {
        model: '',
        buy_time: '',
        manufacturer: '',
        purpose: '',
        price: '',
        status: '可预约'
      }
      this.addDialogVisible = true
    },

    // ================= 2. 提交采购的新设备 (连通后端) =================
    async submitDevice() {
      if (!this.deviceForm.model) {
        this.$message.error('请填写设备型号')
        return
      }

      // 数据清洗：确保价格是数字，日期如果没选置为 null
      const sendData = { ...this.deviceForm }
      sendData.price = sendData.price ? Number(sendData.price) : 0
      if (!sendData.buy_time) {
        sendData.buy_time = null
      }

      try {
        const res = await request({
          url: '/devices/',
          method: 'post',
          data: sendData
        })
        
        const responseData = res.data ? res.data : res
        if (responseData.code === 20000) {
          this.$message.success('新设备采购录入成功！')
          this.addDialogVisible = false
          this.loadDeviceList() // 刷新列表
        } else {
          this.$message.error('录入失败：' + responseData.message)
        }
      } catch (error) {
        console.error('提交异常:', error)
        this.$message.error('请求失败')
      }
    },

    // ================= 打开查看详情弹窗 =================
    openDetailDialog(row) {
      this.currentDevice = { ...row }
      this.detailDialogVisible = true
    },

    // ================= 3. 拍板报废设备 (连通后端) =================
    setScrap() {
      this.$confirm(`确认要将设备「${this.currentDevice.model}」正式报废吗？此操作将使该设备永久不可预约。`, '警告', {
        confirmButtonText: '确认报废',
        cancelButtonText: '取消',
        type: 'error'
      }).then(async () => {
        try {
          const res = await request({
            url: `/devices/${this.currentDevice.id}`, // 复用后端的局部更新接口
            method: 'put',
            data: { status: '已报废' }
          })
          
          const responseData = res.data ? res.data : res
          if (responseData.code === 20000) {
            this.$message.success('设备已成功标记为报废')
            this.detailDialogVisible = false
            this.loadDeviceList() // 刷新表格状态
          }
        } catch (error) {
          console.error('报废异常:', error)
          this.$message.error('操作失败')
        }
      }).catch(() => {})
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
