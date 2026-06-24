<template>
  <div class="page-container">

    <div class="login-box">

      <h1 class="title">管理员登录</h1>

      <el-input
        v-model="username"
        placeholder="请输入用户名"
        class="input"
      />

      <el-input
        v-model="password"
        placeholder="请输入密码"
        show-password
        class="input"
        @keyup.enter.native="handleLogin"
      />

      <el-radio-group v-model="role" class="role-group">
        <el-radio label="admin">设备管理员</el-radio>
        <el-radio label="labLeader">实验室负责人</el-radio>
      </el-radio-group>

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
import { setToken, removeToken } from '@/utils/auth'

export default {
  data() {
    return {
      username: '',
      password: '',
      role: 'admin'
    }
  },
  methods: {
    async handleLogin() {
      if (!this.username.trim() || !this.password.trim()) {
        this.$message.warning('请输入用户名和密码')
        return
      }

      try {
        const res = await request({
          url: '/vue-admin-template/user/login',
          method: 'post',
          data: {
            username: this.username,
            password: this.password
          }
        })

        const responseData = res.data ? res.data : res

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
            this.$message.error('账号身份与所选管理入口不一致，请选择正确身份登录')
            return
          }

          const routeMap = {
            admin: '/admin/device',
            labLeader: '/labLeader/device'
          }

          const targetPath = routeMap[realRole]

          if (targetPath) {
            this.$router.push(targetPath)
          } else {
            removeToken()
            this.$message.error('该账号不是管理员或实验室负责人，不能从管理入口登录')
          }
        } else {
          this.$message.error('登录失败：' + (responseData.message || '未知错误'))
        }
      } catch (error) {
        removeToken()
        this.$message.error('请求失败：' + (error.response?.data?.detail || error.message))
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