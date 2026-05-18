<template>
  <div class="teacher-center-page">

    <!-- 页面标题 -->
    <div class="page-header">

      <div class="title">
        教师个人中心
      </div>

      <div class="desc">
        查看并维护教师个人信息
      </div>

    </div>

    <!-- 信息卡片 -->
    <el-card
      shadow="never"
      class="info-card"
    >

      <el-form
        label-width="120px"
        class="teacher-form"
      >

        <el-row :gutter="40">

          <!-- 教师编号 -->
          <el-col :span="12">

            <el-form-item label="教师编号">

              <el-input
                v-model="teacherInfo.teacherId"
                disabled
              />

            </el-form-item>

          </el-col>

          <!-- 姓名 -->
          <el-col :span="12">

            <el-form-item label="姓名">

              <el-input
                v-model="teacherInfo.name"
                disabled
              />

            </el-form-item>

          </el-col>

          <!-- 性别 -->
          <el-col :span="12">

            <el-form-item label="性别">

              <el-input
                v-model="teacherInfo.gender"
                disabled
              />

            </el-form-item>

          </el-col>

          <!-- 职称 -->
          <el-col :span="12">

            <el-form-item label="职称">

              <el-input
                v-model="teacherInfo.title"
                disabled
              />

            </el-form-item>

          </el-col>

          <!-- 专业方向 -->
          <el-col :span="12">

            <el-form-item label="专业方向">

              <el-input
                v-model="teacherInfo.direction"
                disabled
              />

            </el-form-item>

          </el-col>

          <!-- 学院 -->
          <el-col :span="12">

            <el-form-item label="所在学院">

              <el-input
                v-model="teacherInfo.college"
                disabled
              />

            </el-form-item>

          </el-col>

        </el-row>

      </el-form>

      <!-- 按钮区域 -->
      <div class="button-group">

        <!-- 返回登录 -->
        <el-button
          round
          @click="goLogin"
        >
          返回登录页面
        </el-button>

        <!-- 修改 -->
        <el-button
          type="primary"
          round
          @click="openEditDialog"
        >
          修改个人信息
        </el-button>

      </div>

    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog
      title="教师信息编辑"
      :visible.sync="dialogVisible"
      width="650px"
    >

      <el-form
        :model="editForm"
        label-width="120px"
      >

        <el-row :gutter="40">

          <!-- 教师编号 -->
          <el-col :span="12">

            <el-form-item label="教师编号">

              <el-input
                v-model="editForm.teacherId"
              />

            </el-form-item>

          </el-col>

          <!-- 姓名 -->
          <el-col :span="12">

            <el-form-item label="姓名">

              <el-input
                v-model="editForm.name"
              />

            </el-form-item>

          </el-col>

          <!-- 性别 -->
          <el-col :span="12">

            <el-form-item label="性别">

              <el-select
                v-model="editForm.gender"
                style="width:100%"
              >

                <el-option
                  label="男"
                  value="男"
                />

                <el-option
                  label="女"
                  value="女"
                />

              </el-select>

            </el-form-item>

          </el-col>

          <!-- 职称 -->
          <el-col :span="12">

            <el-form-item label="职称">

              <el-input
                v-model="editForm.title"
              />

            </el-form-item>

          </el-col>

          <!-- 专业方向 -->
          <el-col :span="12">

            <el-form-item label="专业方向">

              <el-input
                v-model="editForm.direction"
              />

            </el-form-item>

          </el-col>

          <!-- 学院 -->
          <el-col :span="12">

            <el-form-item label="所在学院">

              <el-input
                v-model="editForm.college"
              />

            </el-form-item>

          </el-col>

        </el-row>

      </el-form>

      <!-- 底部按钮 -->
      <div slot="footer">

        <el-button
          round
          @click="dialogVisible = false"
        >
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
export default {

  name: 'TeacherCenter',

  data() {

    return {

      dialogVisible: false,

      teacherInfo: {

        teacherId: 'T20250001',
        name: '张老师',
        gender: '男',
        title: '副教授',
        direction: '人工智能',
        college: '计算机学院'

      },

      editForm: {}

    }

  },

  mounted() {

    this.loadTeacherInfo()

  },

  methods: {

    // 读取本地数据
    loadTeacherInfo() {

      const localData =
        localStorage.getItem('teacherInfo')

      if (localData) {

        this.teacherInfo =
          JSON.parse(localData)

      }

    },

    // 打开编辑弹窗
    openEditDialog() {

      this.editForm = {

        ...this.teacherInfo

      }

      this.dialogVisible = true

    },

    // 保存信息
    saveTeacherInfo() {

      if (!this.editForm.name) {

        this.$message.error('请输入姓名')
        return

      }

      // 更新页面数据
      this.teacherInfo = {

        ...this.editForm

      }

      // 存入本地
      localStorage.setItem(
        'teacherInfo',
        JSON.stringify(this.teacherInfo)
      )

      this.$message.success('信息保存成功')

      this.dialogVisible = false

    },

    // 返回登录页
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

/* 页面标题 */

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

  border-radius: 16px;
  border: none;

}

/* 表单 */

.teacher-form {

  margin-top: 20px;

}

/* 按钮区域 */

.button-group {

  margin-top: 30px;

  display: flex;
  justify-content: space-between;

}

</style>
