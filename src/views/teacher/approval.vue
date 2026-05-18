<template>
  <div class="page">



    <div class="layout">



      <!-- ===== 主内容 ===== -->
      <div class="content">

        <!-- 按钮 -->
        <el-button type="primary" @click="studentDialog = true">
          查看指导学生
        </el-button>

        <!-- 审批表格 -->
        <el-card style="margin-top:20px">

          <el-table :data="bookingList" border>

            <el-table-column prop="studentName" label="预约学生信息" />
            <el-table-column prop="deviceName" label="预约设备" />

            <el-table-column label="预约时间">
              <template slot-scope="scope">
                {{ format(scope.row.startTime) }}
                <br />
                至
                <br />
                {{ format(scope.row.endTime) }}
              </template>
            </el-table-column>

            <el-table-column label="操作">

              <template slot-scope="scope">

                <!-- 待审批 -->
                <div v-if="scope.row.status === '待教师审批'">

                  <el-button
                    type="success"
                    size="mini"
                    @click="approve(scope.row.id)"
                  >
                    通过
                  </el-button>

                  <el-button
                    type="danger"
                    size="mini"
                    @click="reject(scope.row.id)"
                  >
                    驳回
                  </el-button>

                </div>

                <!-- 已审批 -->
                <div v-else>
                  <el-tag
                    :type="scope.row.status === '已通过' ? 'success' : 'danger'"
                  >
                    {{ scope.row.status }}
                  </el-tag>
                </div>

              </template>

            </el-table-column>

          </el-table>

        </el-card>

      </div>
    </div>

    <!-- ============================= -->
    <!-- ===== 界面2：学生管理弹窗 ===== -->
    <!-- ============================= -->

    <el-dialog
      title="指导学生管理"
      :visible.sync="studentDialog"
      width="750px"
    >

      <div style="display:flex;justify-content:space-between;margin-bottom:10px">

        <el-button type="primary" @click="addDialog = true">
          添加学生
        </el-button>

        <el-button @click="studentDialog=false">
          返回
        </el-button>

      </div>

      <el-table :data="studentList" border>

        <el-table-column prop="id" label="学号" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="major" label="专业" />
        <el-table-column prop="college" label="学院" />

        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="danger"
              size="mini"
              @click="removeStudent(scope.row.id)"
            >
              解除绑定
            </el-button>
          </template>
        </el-table-column>

      </el-table>

    </el-dialog>

    <!-- ============================= -->
    <!-- ===== 界面3：添加学生弹窗 ===== -->
    <!-- ============================= -->

    <el-dialog
      title="添加学生"
      :visible.sync="addDialog"
      width="500px"
    >

      <el-form :model="form" label-width="80px">

        <el-form-item label="学号">
          <el-input v-model="form.id" />
        </el-form-item>

        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>

        <el-form-item label="性别">
          <el-input v-model="form.gender" />
        </el-form-item>

        <el-form-item label="专业">
          <el-input v-model="form.major" />
        </el-form-item>

        <el-form-item label="学院">
          <el-input v-model="form.college" />
        </el-form-item>

      </el-form>

      <div slot="footer">

        <el-button @click="addDialog=false">取消</el-button>

        <el-button type="primary" @click="addStudent">
          添加学生
        </el-button>

      </div>

    </el-dialog>

  </div>
</template>

<script>
export default {

  data() {
    return {

      bookingList: [],
      studentList: [],

      studentDialog: false,
      addDialog: false,

      form: {
        id: '',
        name: '',
        gender: '',
        major: '',
        college: ''
      }
    }
  },

  mounted() {
    this.loadData()
  },

  methods: {

    /* ======================
       数据加载
    ====================== */
    loadData() {

      const all =
        JSON.parse(localStorage.getItem('booking_all')) || []

      // 只显示：
      // 学生预约
      // 且当前阶段是教师审批

      this.bookingList = all.filter(item => {

        return (
          item.role === 'teacher' &&
          item.currentStep === 'admin'
        )
      })

    },

    /* ======================
       审批逻辑
    ====================== */
    approve(id) {

      const list =
        JSON.parse(localStorage.getItem('booking_all')) || []

      const index =
        list.findIndex(i => i.id === id)

      if (index !== -1) {

        list[index].status = '待管理员审批'

        list[index].currentStep = 'admin'
      }

      localStorage.setItem(
        'booking_all',
        JSON.stringify(list)
      )

      this.loadData()

      this.$message.success('已提交管理员审批')
    },
    reject(id) {

      const list =
        JSON.parse(localStorage.getItem('booking_all')) || []

      const index =
        list.findIndex(i => i.id === id)

      if (index !== -1) {

        list[index].status = '教师已驳回'

        list[index].currentStep = 'end'
      }

      localStorage.setItem(
        'booking_all',
        JSON.stringify(list)
      )

      this.loadData()

      this.$message.error('已驳回申请')
    },

    /* ======================
       学生管理
    ====================== */
    addStudent() {

      if (!this.form.id || !this.form.name) {
        this.$message.error('请填写完整信息')
        return
      }

      const list =
        JSON.parse(localStorage.getItem('teacher_students')) || []

      list.push({ ...this.form })

      localStorage.setItem('teacher_students', JSON.stringify(list))

      this.studentList = list
      this.addDialog = false

      this.$message.success('添加成功')
    },

    removeStudent(id) {

      const list =
        this.studentList.filter(i => i.id !== id)

      localStorage.setItem('teacher_students', JSON.stringify(list))

      this.studentList = list

      this.$message.success('已解除绑定')
    },

    /* ======================
       工具函数
    ====================== */
    format(t) {
      return new Date(t).toLocaleString()
    }

  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.top-bar {
  background: #409eff;
  color: white;
  padding: 12px;
  font-size: 18px;
}

.layout {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 200px;
  background: #f5f5f5;
  padding: 10px;
}

.menu {
  padding: 10px;
  cursor: pointer;
}

.active {
  background: #409eff;
  color: white;
  border-radius: 5px;
}

.content {
  flex: 1;
  padding: 20px;
}
</style>
