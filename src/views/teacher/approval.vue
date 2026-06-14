<template>
  <div class="page">

    <div class="layout">

      <div class="content">

        <!-- 按钮 -->
        <el-button type="primary" @click="openStudentDialog">
          查看指导学生
        </el-button>

        <!-- 审批表格 -->
        <el-card style="margin-top:20px">

          <el-table :data="bookingList" border>

            <el-table-column label="预约学生信息">
              <template slot-scope="scope">
                <div>{{ scope.row.applicantName }}</div>
                <div style="color:#999;font-size:12px;">
                  {{ scope.row.applicantId }}
                </div>
              </template>
            </el-table-column>

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

                <div v-if="scope.row.status === '待指导教师审批'">

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

                <div v-else>
                  <el-tag
                    :type="scope.row.status === '已通过' || scope.row.status === '负责人已通过' ? 'success' : 'info'"
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

    <!-- 指导学生管理弹窗 -->
    <el-dialog
      title="指导学生管理"
      :visible.sync="studentDialog"
      width="850px"
    >

      <div style="display:flex;justify-content:space-between;margin-bottom:10px">

        <el-button type="primary" @click="openAddDialog">
          添加学生
        </el-button>

        <el-button @click="studentDialog=false">
          返回
        </el-button>

      </div>

      <el-table :data="studentList" border>

        <el-table-column prop="username" label="学号" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="gender" label="性别" />
        <el-table-column prop="major" label="专业" />
        <el-table-column prop="college" label="学院" />
        <el-table-column prop="phone" label="电话" />

        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="danger"
              size="mini"
              @click="removeStudent(scope.row.username)"
            >
              解除绑定
            </el-button>
          </template>
        </el-table-column>

      </el-table>

    </el-dialog>

    <!-- 添加学生弹窗 -->
    <el-dialog
      title="添加学生"
      :visible.sync="addDialog"
      width="500px"
    >

      <el-form :model="form" label-width="100px">

        <el-form-item label="学生学号">
          <el-input
            v-model="form.username"
            placeholder="请输入已存在的学生账号/学号"
          />
        </el-form-item>

        <el-alert
          title="说明：这里绑定的是系统中已经存在的学生账号。绑定后，教师查看指导学生时会实时读取该学生的最新个人信息。"
          type="info"
          show-icon
          :closable="false"
        />

      </el-form>

      <div slot="footer">

        <el-button @click="addDialog=false">
          取消
        </el-button>

        <el-button type="primary" @click="addStudent">
          添加学生
        </el-button>

      </div>

    </el-dialog>

  </div>
</template>

<script>
import {
  getStudentApprovals,
  approveStudentBooking,
  rejectStudentBooking
} from '@/api/client'

import {
  getMyStudents,
  bindStudent,
  unbindStudent
} from '@/api/user'

export default {
  name: 'TeacherApproval',

  data() {
    return {
      bookingList: [],
      studentList: [],

      studentDialog: false,
      addDialog: false,

      form: {
        username: ''
      }
    }
  },

  mounted() {
    this.loadData()
    this.loadStudentList()
  },

  methods: {
    loadData() {
      getStudentApprovals().then(res => {
        console.log('教师审批接口返回：', res)
        this.bookingList = res.data.data || []
      }).catch(err => {
        console.log('教师审批接口错误：', err)
        this.$message.error(
          err.response?.data?.detail || '审批列表加载失败'
        )
      })
    },

    loadStudentList() {
      getMyStudents().then(res => {
        console.log('我的指导学生返回：', res)
        this.studentList = res.data.data || []
      }).catch(err => {
        console.log('指导学生列表加载失败：', err)
        this.$message.error(
          err.response?.data?.detail || '指导学生列表加载失败'
        )
      })
    },

    openStudentDialog() {
      this.studentDialog = true
      this.loadStudentList()
    },

    openAddDialog() {
      this.form = {
        username: ''
      }
      this.addDialog = true
    },

    approve(id) {
      approveStudentBooking(id).then(() => {
        this.$message.success('已提交管理员审批')
        this.loadData()
      }).catch(err => {
        this.$message.error(
          err.response?.data?.detail || '审批失败'
        )
      })
    },

    reject(id) {
      rejectStudentBooking(id).then(() => {
        this.$message.error('已驳回申请')
        this.loadData()
      }).catch(err => {
        this.$message.error(
          err.response?.data?.detail || '驳回失败'
        )
      })
    },

    addStudent() {
      if (!this.form.username) {
        this.$message.error('请输入学生学号')
        return
      }

      bindStudent(this.form.username).then(() => {
        this.$message.success('学生绑定成功')
        this.addDialog = false
        this.loadStudentList()
      }).catch(err => {
        this.$message.error(
          err.response?.data?.detail || '学生绑定失败'
        )
      })
    },

    removeStudent(username) {
      this.$confirm('确定要解除该学生的指导关系吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        unbindStudent(username).then(() => {
          this.$message.success('已解除绑定')
          this.loadStudentList()
        }).catch(err => {
          this.$message.error(
            err.response?.data?.detail || '解除绑定失败'
          )
        })
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },

    format(t) {
      if (!t) return ''

      const date = new Date(t)

      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const h = String(date.getHours()).padStart(2, '0')
      const mm = String(date.getMinutes()).padStart(2, '0')

      return `${y}-${m}-${d} ${h}:${mm}`
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

.layout {
  display: flex;
  flex: 1;
}

.content {
  flex: 1;
  padding: 20px;
}
</style>