<template>
  <div class="teacher-center-page">

    <!-- 页面标题 -->
    <div class="page-header">
      <div class="title">教师个人中心</div>
      <div class="desc">查看并维护教师个人信息</div>
    </div>

    <!-- 信息卡片 -->
    <el-card shadow="never" class="info-card">

      <el-form
        label-width="120px"
        class="teacher-form"
      >
        <el-row :gutter="40">

          <el-col :span="12">
            <el-form-item label="教师编号">
              <el-input v-model="teacherInfo.teacherId" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input v-model="teacherInfo.name" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="性别">
              <el-input v-model="teacherInfo.gender" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="职称">
              <el-input v-model="teacherInfo.title" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="专业方向">
              <el-input v-model="teacherInfo.direction" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="所在学院">
              <el-input v-model="teacherInfo.college" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="teacherInfo.phone" disabled />
            </el-form-item>
          </el-col>

        </el-row>
      </el-form>

      <!-- 按钮区域 -->
      <div class="button-group">
        <el-button round @click="goLogin">
          返回登录页面
        </el-button>

        <el-button type="primary" round @click="openEditDialog">
          修改个人信息
        </el-button>
      </div>

    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog
      title="教师信息编辑"
      :visible.sync="dialogVisible"
      width="600px"
    >
      <el-form
        :model="editForm"
        label-width="120px"
      >
        <el-row :gutter="30">

          <el-col :span="12">
            <el-form-item label="教师编号">
              <el-input v-model="editForm.teacherId" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input v-model="editForm.name" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="性别">
              <el-select
                v-model="editForm.gender"
                style="width:100%"
              >
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="职称">
              <el-input v-model="editForm.title" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="专业方向">
              <el-input v-model="editForm.direction" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="所在学院">
              <el-input v-model="editForm.college" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="editForm.phone" />
            </el-form-item>
          </el-col>

        </el-row>
      </el-form>

      <div slot="footer">
        <el-button round @click="dialogVisible = false">
          取消
        </el-button>

        <el-button
          type="primary"
          round
          @click="saveTeacherInfo"
        >
          保存信息并返回个人中心
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getMyProfile, updateMyProfile } from '@/api/user'

export default {
  name: 'TeacherCenter',

  data() {
    return {
      dialogVisible: false,

      teacherInfo: {
        teacherId: '',
        name: '',
        gender: '',
        title: '',
        direction: '',
        college: '',
        phone: ''
      },

      editForm: {}
    }
  },

  mounted() {
    this.loadTeacherInfo()
  },

  methods: {
    loadTeacherInfo() {
      getMyProfile().then(res => {
        const data = res.data.data

        this.teacherInfo = {
          teacherId: data.username || '',
          name: data.name || '',
          gender: data.gender || '',
          title: data.title || '',
          direction: data.major || '',
          college: data.college || '',
          phone: data.phone || ''
        }

        this.editForm = { ...this.teacherInfo }
      }).catch(err => {
        console.log('教师个人信息加载失败：', err)
        this.$message.error('教师个人信息加载失败')
      })
    },

    openEditDialog() {
      this.editForm = { ...this.teacherInfo }
      this.dialogVisible = true
    },

    saveTeacherInfo() {
      if (!this.editForm.name) {
        this.$message.error('请输入姓名')
        return
      }

      updateMyProfile({
        name: this.editForm.name,
        gender: this.editForm.gender,
        title: this.editForm.title,
        major: this.editForm.direction,
        college: this.editForm.college,
        phone: this.editForm.phone
      }).then(() => {
        this.$message.success('信息保存成功')
        this.dialogVisible = false
        this.loadTeacherInfo()
      }).catch(err => {
        console.log('教师个人信息保存失败：', err)
        this.$message.error(
          err.response?.data?.detail || '信息保存失败'
        )
      })
    },

    goLogin() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.teacher-center-page {
  padding: 30px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 标题 */
.page-header {
  margin-bottom: 20px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.desc {
  margin-top: 6px;
  color: #909399;
}

/* 卡片 */
.info-card {
  border-radius: 14px;
  border: none;
}

.teacher-form {
  margin-top: 10px;
}

.button-group {
  margin-top: 30px;
  text-align: center;
}

.button-group .el-button {
  margin: 0 10px;
}
</style>