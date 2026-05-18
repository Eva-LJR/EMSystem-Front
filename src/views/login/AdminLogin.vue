<template>
  <div class="page-container">

    <div class="login-box">

      <h1 class="title">管理员登录</h1>

      <!-- 用户名 -->
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

        <el-radio label="manager">设备管理员</el-radio>
        <el-radio label="leader">实验室负责人</el-radio>

      </el-radio-group>

      <!-- 登录按钮 -->
      <el-button
        type="primary"
        class="login-btn"
        @click="handleLogin"
      >
        登录
      </el-button>

    </div>

  </div>
</template>

<script>
import request from '@/utils/request'
import { setToken } from '@/utils/auth'

export default {
  data() {
    return {
      username: '',   // 声明
      password: '',   // 声明
      role: 'manager'
    }
  },
  methods: {
    async handleLogin() {
    console.log(this.username, this.password, this.role)
      try {
        const res = await request({
          url: '/vue-admin-template/user/login',
          method: 'post',
          data: {
            username: this.username,
            password: this.password,
            role: this.role
          }
        })
        console.log('完整响应:', res)                // 看完整响应
        console.log('响应数据:', res.data)          // 看 data 字段
        console.log('code:', res.data.code)        // 看 code 值

        if (res.data.code === 20000) {
          console.log('登录成功，准备跳转')
          const token = res.data.data.token
          setToken(token)
          // 跳转...
          if (this.role === 'manager') {
            this.$router.push('/admin/device')
          } else if (this.role === 'leader') {
            this.$router.push('/labLeader/device')
          }
        } else {
          console.log('code 不是 20000，登录失败')
          this.$message.error('登录失败：' + (res.data.message || '未知错误'))
        }
      } catch (error) {
        console.error('请求异常:', error)
        this.$message.error('请求失败：' + error.message)
      }
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
