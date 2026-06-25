<template>
  <div class="register-container">
    <div class="register-card">
      <h2 class="title">用户注册</h2>
      <p class="subtitle">学校实验设备多角色预约与协同管理平台</p>

      <el-form
        ref="registerForm"
        :model="form"
        :rules="rules"
        label-width="90px"
        class="register-form"
      >
        <el-form-item label="注册身份" prop="role">
          <el-radio-group v-model="form.role" @change="handleRoleChange">
            <el-radio label="student">学生</el-radio>
            <el-radio label="teacher">教师</el-radio>
            <el-radio label="outside">校外人员</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="form.role === 'student'"
          label="学号"
          prop="identity_no"
          required
        >
          <el-input
            v-model="form.identity_no"
            placeholder="请输入学号，注册后将作为登录账号"
            clearable
          />
        </el-form-item>
        <el-form-item
          v-if="form.role === 'student'"
          label="教师工号"
          prop="teacher_identity_no"
          required
        >
          <el-input
            v-model="form.teacher_identity_no"
            placeholder="请输入指导教师工号，例如 T2024001"
            clearable
          />
        </el-form-item>

        <el-form-item
          v-if="form.role === 'teacher'"
          label="工号"
          prop="identity_no"
          required
        >
          <el-input
            v-model="form.identity_no"
            placeholder="请输入工号，注册后将作为登录账号"
            clearable
          />
        </el-form-item>

        <el-form-item
          v-if="form.role === 'outside'"
          label="手机号"
          prop="phone"
          required
        >
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号，注册后将作为登录账号"
            clearable
          />
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入姓名"
            clearable
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码，至少6位"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="性别">
          <el-select v-model="form.gender" placeholder="请选择性别" clearable style="width: 100%">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>

        <template v-if="form.role === 'student' || form.role === 'teacher'">
          <el-form-item label="学院">
            <el-input
              v-model="form.college"
              placeholder="请输入学院"
              clearable
            />
          </el-form-item>

          <el-form-item label="专业">
            <el-input
              v-model="form.major"
              placeholder="请输入专业"
              clearable
            />
          </el-form-item>
        </template>

        <el-form-item v-if="form.role === 'teacher'" label="职称">
          <el-input
            v-model="form.title"
            placeholder="请输入职称，如讲师、副教授"
            clearable
          />
        </el-form-item>

        <el-form-item v-if="form.role === 'outside'" label="单位">
          <el-input
            v-model="form.company"
            placeholder="请输入所属单位或公司名称"
            clearable
          />
        </el-form-item>

        <el-form-item v-if="form.role !== 'outside'" label="手机号">
          <el-input
            v-model="form.phone"
            placeholder="请输入手机号，可选"
            clearable
          />
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱，可选"
            clearable
          />
        </el-form-item>

        <el-button
          type="primary"
          class="register-btn"
          :loading="loading"
          @click="handleRegister"
        >
          注册
        </el-button>

        <div class="bottom-links">
          <span>已有账号？</span>
          <el-link type="primary" @click="goLogin">返回登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { register } from '@/api/user'

export default {
  name: 'Register',
  data() {
    const validateAccount = (rule, value, callback) => {
      if (this.form.role === 'student' || this.form.role === 'teacher') {
        if (!value || !value.trim()) {
          callback(new Error(this.form.role === 'student' ? '请输入学号' : '请输入工号'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }

    const validatePhone = (rule, value, callback) => {
      if (this.form.role === 'outside') {
        if (!value || !value.trim()) {
          callback(new Error('请输入手机号'))
        } else if (!/^1[3-9]\d{9}$/.test(value.trim())) {
          callback(new Error('请输入正确的手机号'))
        } else {
          callback()
        }
      } else {
        if (value && value.trim() && !/^1[3-9]\d{9}$/.test(value.trim())) {
          callback(new Error('请输入正确的手机号'))
        } else {
          callback()
        }
      }
    }

    const validateConfirmPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.form.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    const validateTeacherNo = (rule, value, callback) => {
      if (this.form.role === 'student') {
        if (!value || !value.trim()) {
          callback(new Error('请输入指导教师工号'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }

    return {
      loading: false,
      form: {
        role: 'student',
        identity_no: '',
        phone: '',
        password: '',
        confirmPassword: '',
        name: '',
        gender: '',
        teacher_identity_no: '',
        email: '',
        college: '',
        major: '',
        title: '',
        company: ''
      },
      rules: {
        role: [
          { required: true, message: '请选择注册身份', trigger: 'change' }
        ],
        identity_no: [
          { validator: validateAccount, trigger: 'blur' }
        ],
        teacher_identity_no: [
          { validator: validateTeacherNo, trigger: 'blur' }
        ],
        phone: [
          { validator: validatePhone, trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleRoleChange() {
      this.form.identity_no = ''
      this.form.teacher_identity_no = ''
      this.form.phone = ''
      this.form.company = ''
      this.form.title = ''

      this.$nextTick(() => {
        this.$refs.registerForm.clearValidate()
      })
    },

    handleRegister() {
      this.$refs.registerForm.validate(valid => {
        if (!valid) return

        const payload = {
          role: this.form.role,
          password: this.form.password,
          name: this.form.name,
          gender: this.form.gender || null,
          email: this.form.email || null,
          phone: this.form.phone || null,
          identity_no: this.form.identity_no || null,
          teacher_identity_no: this.form.teacher_identity_no || null,
          college: this.form.college || null,
          major: this.form.major || null,
          title: this.form.title || null,
          company: this.form.company || null
        }

        this.loading = true

        register(payload)
          .then(res => {
            const msg = res.data && res.data.message ? res.data.message : '注册成功'
            this.$message.success(msg)

            setTimeout(() => {
              this.goLogin()
            }, 800)
          })
          .catch(error => {
            const detail =
              error.response &&
              error.response.data &&
              error.response.data.detail

            this.$message.error(detail || '注册失败，请检查填写信息')
          })
          .finally(() => {
            this.loading = false
          })
      })
    },

    goLogin() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f5ff, #e6f7ff);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
  box-sizing: border-box;
}

.register-card {
  width: 520px;
  background: #fff;
  padding: 34px 42px 28px;
  border-radius: 12px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
}

.title {
  text-align: center;
  margin: 0;
  font-size: 26px;
  color: #303133;
}

.subtitle {
  text-align: center;
  color: #909399;
  font-size: 14px;
  margin: 10px 0 28px;
}

.register-form {
  width: 100%;
}

.register-btn {
  width: 100%;
  margin-top: 8px;
}

.bottom-links {
  margin-top: 18px;
  text-align: center;
  color: #606266;
}

.bottom-links span {
  margin-right: 8px;
}
</style>