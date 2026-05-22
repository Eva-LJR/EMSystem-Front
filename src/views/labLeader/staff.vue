<template>
  <div class="staff-page">

    <!-- ================= 标题 ================= -->
    <div class="page-header">
      <div class="title">
        人员管理
      </div>

      <div class="desc">
        设备管理员信息管理
      </div>
    </div>

    <!-- ================= 人员表格 ================= -->
    <el-card shadow="never" class="table-card">

      <el-table
        :data="staffList"
        border
        style="width:100%;"
      >

        <!-- 姓名 -->
        <el-table-column
          prop="name"
          label="姓名"
          align="center"
        />

        <!-- 编号 -->
        <el-table-column
          prop="id"
          label="编号"
          align="center"
        />

        <!-- 操作 -->
        <el-table-column
          label="操作"
          align="center"
          width="180"
        >

          <template slot-scope="scope">

            <el-button
              type="primary"
              size="mini"
              @click="openDetail(scope.row)"
            >
              查看详情
            </el-button>

          </template>

        </el-table-column>

      </el-table>

    </el-card>

    <!-- ================= 返回按钮 ================= -->
    <div class="bottom-btn">

      <el-button @click="$router.back()">
        返回
      </el-button>

    </div>

    <!-- ================= 人员详情弹窗 ================= -->
    <el-dialog
      title="人员详情"
      :visible.sync="dialogVisible"
      width="600px"
    >

      <!-- 详情表格 -->
      <el-table
        :data="detailTable"
        border
        :show-header="false"
      >

        <el-table-column
          prop="label"
          width="180"
          align="center"
        />

        <el-table-column
          prop="value"
          align="center"
        />

      </el-table>

      <!-- 底部按钮 -->
      <div slot="footer">

        <!-- 删除 -->
        <el-button
          type="danger"
          @click="deleteStaff"
        >
          删除
        </el-button>

        <!-- 返回 -->
        <el-button @click="dialogVisible = false">
          返回
        </el-button>

      </div>

    </el-dialog>

  </div>
</template>

<script>
import request from '@/utils/request' // 确保引入了封装好的 axios

export default {
  name: 'LabLeaderStaff',
  data() {
    return {
      staffList: [],
      dialogVisible: false,
      currentStaff: null
    }
  },
  mounted() {
    this.loadStaff() // 页面挂载时加载真实数据
  },
  computed: {
    detailTable() {
      if (!this.currentStaff) return []
      return [
        { label: '姓名', value: this.currentStaff.username }, // 假设后端字段名为 username
        { label: '编号', value: this.currentStaff.id },
        { label: '角色', value: this.currentStaff.role } 
      ]
    }
  },
  methods: {
    // ================= 加载真实管理员列表 =================
    async loadStaff() {
      try {
        const res = await request({
          url: '/users/', // 替换为你后端的真实 API
          method: 'get',
          params: { role: 'admin' } // 只获取管理员
        })
        if (res.data.code === 20000) {
          this.staffList = res.data.data
        }
      } catch (error) {
        this.$message.error('获取人员列表失败')
      }
    },

    openDetail(row) {
      this.currentStaff = row
      this.dialogVisible = true
    },

    // ================= 物理删除管理员 =================
    async deleteStaff() {
      this.$confirm('确定删除该管理员吗？', '提示', { type: 'warning' })
        .then(async () => {
          try {
            await request({
              url: `/users/${this.currentStaff.id}`, // 触发后端物理删除
              method: 'delete'
            })
            this.$message.success('删除成功')
            this.dialogVisible = false
            this.loadStaff() // 刷新列表
          } catch (error) {
            this.$message.error('删除失败')
          }
        })
    }
  }
}
</script>

<style scoped>

.staff-page {
  padding: 30px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* ================= 标题 ================= */

.page-header {
  margin-bottom: 20px;
}

.title {
  font-size: 30px;
  font-weight: bold;
  color: #303133;
}

.desc {
  margin-top: 6px;
  color: #909399;
}

/* ================= 卡片 ================= */

.table-card {
  border-radius: 14px;
}

/* ================= 底部按钮 ================= */

.bottom-btn {
  margin-top: 25px;
  display: flex;
  justify-content: center;
}

</style>
