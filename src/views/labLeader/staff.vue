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
export default {

  name: 'LabLeaderStaff',

  data() {
    return {

      // 人员列表
      staffList: [],

      // 弹窗
      dialogVisible: false,

      // 当前人员
      currentStaff: null

    }
  },

  mounted() {

    this.loadStaff()

  },

  computed: {

    // 详情表格
    detailTable() {

      if (!this.currentStaff) return []

      return [

        {
          label: '姓名',
          value: this.currentStaff.name
        },

        {
          label: '性别',
          value: this.currentStaff.gender
        },

        {
          label: '编号',
          value: this.currentStaff.id
        },

        {
          label: '密码',
          value: this.currentStaff.password
        }

      ]
    }

  },

  methods: {

    // ================= 加载管理员 =================
    loadStaff() {

      const list =
        JSON.parse(localStorage.getItem('admin_staff'))

      // 第一次进入系统默认数据
      if (!list || list.length === 0) {

        this.staffList = [

          {
            id: 'A001',
            name: '张管理员',
            gender: '男',
            password: '123456'
          },

          {
            id: 'A002',
            name: '李管理员',
            gender: '女',
            password: '123456'
          },

          {
            id: 'A003',
            name: '王管理员',
            gender: '男',
            password: '123456'
          }

        ]

        localStorage.setItem(
          'admin_staff',
          JSON.stringify(this.staffList)
        )
      }

      else {

        this.staffList = list

      }

    },

    // ================= 打开详情 =================
    openDetail(row) {

      this.currentStaff = row

      this.dialogVisible = true

    },

    // ================= 删除人员 =================
    deleteStaff() {

      this.$confirm(
        '确定删除该人员吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {

          // 删除
          this.staffList =
            this.staffList.filter(
              item => item.id !== this.currentStaff.id
            )

          // 保存
          localStorage.setItem(
            'admin_staff',
            JSON.stringify(this.staffList)
          )

          // 关闭
          this.dialogVisible = false

          // 提示
          this.$message.success('删除成功')

        })
        .catch(() => {

          this.$message.info('已取消删除')

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
