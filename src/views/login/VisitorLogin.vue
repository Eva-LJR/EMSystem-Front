<template>
  <div class="page-container">

    <div class="login-box">

      <h1 class="title">访客登录</h1>

      <!-- 账号 -->
      <el-input
        v-model="username"
        placeholder="请输入用户名"
        class="input"
      />

      <!-- 密码 -->
      <el-input
        v-model="password"
        placeholder="请输入密码"
        show-password
        class="input"
      />

      <!-- 身份选择 -->
      <el-radio-group v-model="role" class="role-group">

        <el-radio label="student">学生</el-radio>
        <el-radio label="teacher">教师</el-radio>
        <el-radio label="outside">校外人员</el-radio>

      </el-radio-group>

      <!-- 登录按钮 -->
      <el-button
        type="primary"
        class="login-btn"
        @click="handleLogin"
      >
        登录
      </el-button>
      
      <!-- 注册按钮 -->
      <el-button
        type="text"
        class="register-link"
        @click="goRegister"
      >
        没有账号？立即注册
      </el-button>

    </div>

  </div>
</template>

<script>
import { setToken, removeToken } from '@/utils/auth'
import request from '@/utils/request'

export default {
  name: 'VisitorLogin',
  data() {
    return {
      username: '',
      password: '',
      role: ''
    }
  },
  methods: {
    async handleLogin() {
      if (!this.username.trim() || !this.password.trim()) {
        this.$message.warning('请输入用户名和密码')
        return
      }

      if (!this.role) {
        this.$message.warning('请选择身份')
        return
      }

      try {
        const response = await request({
          url: '/vue-admin-template/user/login',
          method: 'post',
          data: {
            username: this.username,
            password: this.password
          }
        })

        const responseData = response.data ? response.data : response

        if (responseData.code === 20000) {
          const token = responseData.data.token
          setToken(token)

          const infoRes = await request({
            url: '/vue-admin-template/user/info',
            method: 'get'
          })

          const infoData = infoRes.data ? infoRes.data.data : infoRes.data
          const realRole = infoData.role || (infoData.roles && infoData.roles[0])

          if (realRole !== this.role) {
            removeToken()
            this.$message.error('账号身份与所选登录入口不一致，请选择正确身份登录')
            return
          }

          const routeMap = {
            student: '/student/center',
            teacher: '/teacher/center',
            outside: '/outside/center'
          }

          this.$router.push(routeMap[realRole])
        } else {
          this.$message.error('登录失败')
        }
      } catch (error) {
        removeToken()
        this.$message.error('请求失败：' + (error.response?.data?.detail || error.message))
      }
    },

    goRegister() {
      this.$router.push('/register')
    }
  }
}
</script>

<style scoped>
.page-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
}

.login-box {
  width: 360px;
  padding: 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  text-align: center;
}

.register-link {
  width: 100%;
  margin-top: 10px;
}

.title {
  margin-bottom: 20px;
}

.input {
  margin-bottom: 15px;
}

.role-group {
  margin: 15px 0;
}

.login-btn {
  width: 100%;
}
</style>
