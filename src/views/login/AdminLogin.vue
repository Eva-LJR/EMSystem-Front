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
import { setToken } from '@/utils/auth'

export default {
  data() {
    return {
      username: '',   
      password: '',   
      role: 'admin' // 默认选中第一个“设备管理员”
    }
  },
  methods: {
    async handleLogin() {
      console.log('正在登录，参数：', this.username, this.password, this.role)
      
      // 表单简单校验
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
            password: this.password,
            role: this.role // 传给后端的角色（对齐为 admin 或 labLeader）
          }
        })
        
        console.log('完整响应:', res)               
        console.log('响应数据:', res.data)          
        console.log('code:', res.data?.code)        

        // 统一处理可能存在的响应结构差异（部分拦截器会自动剥离 res.data）
        const responseData = res.data ? res.data : res

        if (responseData.code === 20000) {
          console.log('登录成功，准备保存 Token 并跳转')
          
          // 1. 保存 Token
          const token = responseData.data.token
          setToken(token)
          
          // 2. 修复点 2：建立清晰的角色路由映射表，完美对应你的 index.js 配置
          const routeMap = {
            'admin': '/admin/device',          // 设备管理员主页
            'labLeader': '/labLeader/device'   // 实验室负责人主页
          }

          const targetPath = routeMap[this.role]

          if (targetPath) {
            this.$router.push(targetPath)
          } else {
            this.$message.error('未找到对应角色的路由映射，请检查配置')
          }

        } else {
          console.log('code 不是 20000，登录失败')
          this.$message.error('登录失败：' + (responseData.message || '未知错误'))
        }
      } catch (error) {
        console.error('请求异常:', error)
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