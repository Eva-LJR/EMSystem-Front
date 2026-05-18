<template>
  <div class="device-admin-page">

    <!-- ================= 顶部操作栏 ================= -->
    <div class="top-bar">

      <!-- 搜索 -->
      <el-input
        v-model="searchKeyword"
        placeholder="搜索设备名称"
        prefix-icon="el-icon-search"
        class="search-input"
        clearable
      />

      <!-- 添加设备 -->
      <el-button
        type="primary"
        icon="el-icon-setting"
        @click="openAddDialog"
      >
        添加新设备
      </el-button>

    </div>

    <!-- ================= 设备列表 ================= -->
    <el-card class="table-card" shadow="never">

      <el-table :data="filterDeviceList" border style="width: 100%">

        <el-table-column prop="id" label="设备编号" align="center" />

        <el-table-column prop="model" label="设备型号" align="center" />

        <el-table-column label="可用状态" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === '可预约'" type="success">可预约</el-tag>
            <el-tag v-else-if="scope.row.status === '检修中'" type="warning">检修中</el-tag>
            <el-tag v-else-if="scope.row.status === '使用中'" type="danger">使用中</el-tag>
            <el-tag v-else type="info">已报废</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="编辑设备信息" align="center">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              @click="openEditDialog(scope.row)"
            >
              编辑
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

    <!-- ================= 弹窗（新增/编辑） ================= -->
    <el-dialog
      :title="isEditMode ? '编辑设备' : '新增设备'"
      :visible.sync="dialogVisible"
      width="650px"
    >

      <el-form :model="deviceForm" label-width="120px">

        <el-form-item label="设备型号">
          <el-input v-model="deviceForm.model" />
        </el-form-item>

        <el-form-item label="设备编号">
          <el-input v-model="deviceForm.id" :disabled="isEditMode" />
        </el-form-item>

        <el-form-item label="购入时间">
          <el-date-picker
            v-model="deviceForm.buyTime"
            type="date"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="生产厂商">
          <el-input v-model="deviceForm.manufacturer" />
        </el-form-item>

        <el-form-item label="实验用途">
          <el-input
            type="textarea"
            v-model="deviceForm.purpose"
          />
        </el-form-item>

        <el-form-item label="可用时段">
          <el-date-picker
            v-model="deviceForm.availableTime"
            type="datetimerange"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="租用价格">
          <el-input v-model="deviceForm.price" type="number" />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="deviceForm.status" style="width: 100%">
            <el-option label="可预约" value="可预约" />
            <el-option label="检修中" value="检修中" />
            <el-option label="使用中" value="使用中" />
            <el-option label="已报废" value="已报废" />
          </el-select>
        </el-form-item>

      </el-form>

      <!-- 底部按钮 -->
      <div slot="footer" class="dialog-footer">

        <el-button @click="dialogVisible = false">
          返回设备页
        </el-button>

        <el-button
          type="primary"
          @click="submitDevice"
        >
          {{ isEditMode ? '保存设备信息' : '添加设备' }}
        </el-button>

      </div>

    </el-dialog>

  </div>
</template>

<script>
export default {
  name: 'DeviceAdmin',

  data() {
    return {

      searchKeyword: '',

      dialogVisible: false,
      isEditMode: false,

      deviceForm: {
        id: '',
        model: '',
        buyTime: '',
        manufacturer: '',
        purpose: '',
        availableTime: '',
        price: '',
        status: '可预约'
      },

      // ⭐设备列表
      deviceList: []

    }
  },

  // ⭐页面加载
  mounted() {
    this.loadDeviceList()
  },

  computed: {

    filterDeviceList() {
      return this.deviceList.filter(i =>
        i.model.includes(this.searchKeyword)
      )
    }
  },

  methods: {
    // 返回登录页
    goLogin() {
      this.$router.push('/')
    },
    // ================= 加载设备 =================
    loadDeviceList() {

      const list =
        JSON.parse(localStorage.getItem('device_list'))

      // ⭐第一次进入系统默认数据
      if (!list || list.length === 0) {

        this.deviceList = [

          {
            id: 'D001',
            model: '示波器X1',
            status: '可预约',
            buyTime: '',
            manufacturer: 'Keysight',
            purpose: '电子信号测量',
            availableTime: '',
            price: 50
          },

          {
            id: 'D002',
            model: '3D打印机Pro',
            status: '使用中',
            buyTime: '',
            manufacturer: 'Creality',
            purpose: '模型打印',
            availableTime: '',
            price: 120
          }
        ]

        // ⭐首次写入本地
        localStorage.setItem(
          'device_list',
          JSON.stringify(this.deviceList)
        )
      }

      else {

        this.deviceList = list
      }
    },

    // ================= 新增 =================
    openAddDialog() {

      this.isEditMode = false

      this.deviceForm = {
        id: '',
        model: '',
        buyTime: '',
        manufacturer: '',
        purpose: '',
        availableTime: '',
        price: '',
        status: '可预约'
      }

      this.dialogVisible = true
    },

    // ================= 编辑 =================
    openEditDialog(row) {

      this.isEditMode = true

      this.deviceForm = { ...row }

      this.dialogVisible = true
    },

    // ================= 提交 =================
    submitDevice() {

      if (!this.deviceForm.id || !this.deviceForm.model) {

        this.$message.error('请填写完整信息')
        return
      }

      // ================= 编辑 =================
      if (this.isEditMode) {

        const index =
          this.deviceList.findIndex(
            i => i.id === this.deviceForm.id
          )

        if (index !== -1) {

          // ⭐Vue响应式更新
          this.$set(
            this.deviceList,
            index,
            { ...this.deviceForm }
          )
        }

        this.$message.success('设备信息更新成功')
      }

      // ================= 新增 =================
      else {

        const exists =
          this.deviceList.some(
            i => i.id === this.deviceForm.id
          )

        if (exists) {

          this.$message.error('设备编号已存在')
          return
        }

        // ⭐新增
        this.deviceList.push({
          ...this.deviceForm
        })

        this.$message.success('设备添加成功')
      }

      // ⭐同步保存本地
      localStorage.setItem(
        'device_list',
        JSON.stringify(this.deviceList)
      )

      // ⭐刷新列表
      this.loadDeviceList()

      // ⭐关闭弹窗
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>

.device-admin-page {
  padding: 30px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 顶部栏 */
.top-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

/* 表格 */
.table-card {
  border-radius: 12px;
}

</style>
