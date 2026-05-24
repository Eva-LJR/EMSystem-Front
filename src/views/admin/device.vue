<template>
  <div class="device-admin-page">

    <div class="top-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索设备型号"
        prefix-icon="el-icon-search"
        class="search-input"
        clearable
      />

      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="openAddDialog"
      >
        添加新设备
      </el-button>
    </div>

    <el-card class="table-card" shadow="never">
      <el-table :data="filterDeviceList" border style="width: 100%">
        <el-table-column prop="id" label="设备编号" width="100" align="center" />
        <el-table-column prop="model" label="设备型号" align="center" />
        <el-table-column prop="manufacturer" label="生产厂商" align="center" />
        <el-table-column prop="price" label="租用价格 (元)" width="120" align="center" />
        
        <el-table-column label="可用状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === '可预约'" type="success">可预约</el-tag>
            <el-tag v-else-if="scope.row.status === '检修中'" type="warning">检修中</el-tag>
            <el-tag v-else-if="scope.row.status === '使用中'" type="danger">使用中</el-tag>
            <el-tag v-else type="info">已报废</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              @click="openEditDialog(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="mini"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="bottom-btns">
        <el-button class="back-btn" @click="goLogin">
          返回登录页面
        </el-button>
      </div>
    </el-card>

    <el-dialog
      :title="isEditMode ? '编辑设备' : '新增设备'"
      :visible.sync="dialogVisible"
      width="650px"
    >
      <el-form :model="deviceForm" label-width="120px">
        <el-form-item label="设备型号">
          <el-input v-model="deviceForm.model" placeholder="请输入设备型号" />
        </el-form-item>

        <el-form-item label="购入时间">
          <el-date-picker
            v-model="deviceForm.buy_time"
            type="date"
            placeholder="选择购入日期"
            style="width: 100%"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>

        <el-form-item label="生产厂商">
          <el-input v-model="deviceForm.manufacturer" placeholder="请输入厂商名称" />
        </el-form-item>

        <el-form-item label="实验用途">
          <el-input type="textarea" v-model="deviceForm.purpose" placeholder="请输入主要实验用途" />
        </el-form-item>

        <el-form-item label="可用时段">
          <el-date-picker
            v-model="timeRange"
            type="datetimerange"
            style="width: 100%"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="租用价格">
          <el-input v-model.number="deviceForm.price" type="number" placeholder="单位：元" />
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

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">返回设备页</el-button>
        <el-button type="primary" @click="submitDevice">
          {{ isEditMode ? '保存设备信息' : '添加设备' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 引入封装好的统一 axios 请求工具
import request from '@/utils/request'

export default {
  name: 'DeviceAdmin',

  data() {
    return {
      searchKeyword: '',
      dialogVisible: false,
      isEditMode: false,
      
      // 存储时间选择器生成的 [开始, 结束] 数组
      timeRange: [],

      // 核心表单对象：完全对齐后端 schemas.py 中的 DeviceBase 结构
      deviceForm: {
        id: null,
        model: '',
        buy_time: '',
        manufacturer: '',
        purpose: '',
        available_time: '',
        price: 0,
        status: '可预约'
      },

      deviceList: []
    }
  },

  mounted() {
    this.loadDeviceList()
  },

  computed: {
    // 过滤设备型号
    filterDeviceList() {
      return this.deviceList.filter(i =>
        i.model && i.model.toLowerCase().includes(this.searchKeyword.toLowerCase())
      )
    }
  },

  methods: {
    goLogin() {
      this.$router.push('/')
    },

    // ================= 1. 加载设备（查） =================
    async loadDeviceList() {
      try {
        const res = await request({
          url: '/devices/', // 匹配后端 @router.get("/") 接口
          method: 'get'
        })
        const responseData = res.data ? res.data : res
        if (responseData.code === 20000) {
          this.deviceList = responseData.data
        } else {
          this.$message.error('获取设备列表失败：' + responseData.message)
        }
      } catch (error) {
        console.error('加载异常:', error)
        this.$message.error('无法连接到后端服务器')
      }
    },

    // 打开新增弹窗
    openAddDialog() {
      this.isEditMode = false
      this.timeRange = [] // 清空时间段
      this.deviceForm = {
        id: null, // 新增时不传 ID，由底层 SQLite 自动生成
        model: '',
        buy_time: '',
        manufacturer: '',
        purpose: '',
        available_time: '',
        price: 0,
        status: '可预约'
      }
      this.dialogVisible = true
    },

    // 打开编辑弹窗
    openEditDialog(row) {
      this.isEditMode = true
      // 深拷贝选中的那一行数据
      this.deviceForm = { ...row }
      
      // 反解析：把后端的可用时段字符串拆开重新塞给前端时间组件
      if (this.deviceForm.available_time && this.deviceForm.available_time.includes(' 至 ')) {
        this.timeRange = this.deviceForm.available_time.split(' 至 ')
      } else {
        this.timeRange = []
      }
      this.dialogVisible = true
    },

    // ================= 2. 提交表单（增 / 改） =================
    async submitDevice() {
      if (!this.deviceForm.model) {
        this.$message.error('请填写设备型号')
        return
      }

      // 序列化：把前端组件的数组时间范围拼接成符合后端数据库的单条 String 存入
      if (this.timeRange && this.timeRange.length === 2) {
        this.deviceForm.available_time = `${this.timeRange[0]} 至 ${this.timeRange[1]}`
      } else {
        this.deviceForm.available_time = ''
      }

      try {
        let res
        if (this.isEditMode) {
          // ================= 编辑保存 =================
          res = await request({
            url: `/devices/${this.deviceForm.id}`, // 对应后端 @router.put("/{device_id}")
            method: 'put',
            data: this.deviceForm
          })
        } else {
          // ================= 新增提交 =================
          // 剔除空的 id 属性，让后端自行构建主键自增
          const sendData = { ...this.deviceForm }
          delete sendData.id

          res = await request({
            url: '/devices/', // 对应后端 @router.post("/")
            method: 'post',
            data: sendData
          })
        }

        const responseData = res.data ? res.data : res

        if (responseData.code === 20000) {
          this.$message.success(this.isEditMode ? '修改设备成功！' : '添加设备成功！')
          this.dialogVisible = false
          this.loadDeviceList() // 刷新页面
        } else {
          this.$message.error('操作失败：' + responseData.detail || responseData.message)
        }
      } catch (error) {
        console.error('提交错误:', error)
        this.$message.error('请求失败：' + (error.response?.data?.detail || error.message))
      }
    },

    // ================= 3. 删除设备（删） =================
    handleDelete(row) {
      this.$confirm(`确认要永久删除设备「${row.model}」吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await request({
            url: `/devices/${row.id}`, // 对应后端 @router.delete("/{device_id}")
            method: 'delete'
          })
          const responseData = res.data ? res.data : res
          if (responseData.code === 20000) {
            this.$message.success('设备已成功报废物理删除')
            this.loadDeviceList() // 重新拉取
          }
        } catch (error) {
          this.$message.error('删除失败，可能该设备有关联的预约订单')
        }
      }).catch(() => {})
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
.top-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.search-input {
  width: 300px;
}
.table-card {
  border-radius: 12px;
}
.bottom-btns {
  margin-top: 20px;
  text-align: left;
}
</style>