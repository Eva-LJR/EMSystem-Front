<template>
  <div class="student-center-page">

    <!-- 页面标题 -->
    <div class="page-header">
      <div class="title">学生个人中心</div>
      <div class="desc">查看与修改个人信息</div>
    </div>

    <!-- 信息卡片 -->
    <el-card class="info-card" shadow="never">

      <el-form
        :model="studentForm"
        label-width="120px"
        class="student-form"
      >

        <!-- 学号 -->
        <el-form-item label="学号">
          <el-input
            v-model="studentForm.studentId"
            :disabled="true"
          />
        </el-form-item>

        <!-- 姓名 -->
        <el-form-item label="姓名">
          <el-input
            v-model="studentForm.name"
            :disabled="!isEdit"
          />
        </el-form-item>

        <!-- 性别 -->
        <el-form-item label="性别">
          <el-select
            v-model="studentForm.gender"
            placeholder="请选择性别"
            style="width: 100%;"
            :disabled="!isEdit"
          >
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>

        <!-- 专业 -->
        <el-form-item label="专业">
          <el-input
            v-model="studentForm.major"
            :disabled="!isEdit"
          />
        </el-form-item>

        <!-- 导师 -->
        <el-form-item label="导师">
          <el-input
            v-model="studentForm.teacher"
            :disabled="!isEdit"
          />
        </el-form-item>

        <!-- 学院 -->
        <el-form-item label="所在学院">
          <el-input
            v-model="studentForm.college"
            :disabled="!isEdit"
          />
        </el-form-item>

      </el-form>

      <!-- 底部按钮 -->
      <div class="bottom-btns">

        <el-button
          class="back-btn"
          @click="goLogin"
        >
          返回登录页面
        </el-button>

        <el-button
          type="primary"
          class="edit-btn"
          @click="handleEdit"
        >
          {{ isEdit ? '保存信息' : '修改个人信息' }}
        </el-button>

      </div>

    </el-card>

  </div>
</template>

<script>
export default {
  name: 'StudentCenter',

  data() {
    return {

      // 是否编辑状态
      isEdit: false,

      // 学生信息
      studentForm: {
        studentId: '2023001001',
        name: '张三',
        gender: '男',
        major: '计算机科学与技术',
        teacher: '李教授',
        college: '计算机学院'
      }

    }
  },

  methods: {

    // 返回登录页
    goLogin() {
      this.$router.push('/')
    },

    // 编辑 / 保存
    handleEdit() {

      // 保存状态
      if (this.isEdit) {

        // 这里以后接后端接口
        console.log('保存信息：', this.studentForm)

        this.$message({
          message: '信息保存成功',
          type: 'success'
        })
      }

      this.isEdit = !this.isEdit
    }

  }
}
</script>

<style scoped>

.student-center-page {
  padding: 30px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 页面标题 */
.page-header {
  margin-bottom: 25px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.desc {
  margin-top: 8px;
  color: #909399;
  font-size: 14px;
}

/* 卡片 */
.info-card {
  border-radius: 14px;
  padding: 20px;
  border: none;
}

/* 表单 */
.student-form {
  margin-top: 10px;
}

/* 按钮区域 */
.bottom-btns {
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
}

/* 返回按钮 */
.back-btn {
  background: #ebeef5;
  border: none;
  color: #606266;
  border-radius: 8px;
  padding: 12px 22px;
}

/* 编辑按钮 */
.edit-btn {
  border-radius: 8px;
  padding: 12px 24px;
}

</style>
