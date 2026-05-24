<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-button type="text" @click="showChangePasswordDialog = true">修改密码</el-button>
      <el-button type="text" @click="logout">退出登录</el-button>
    </div>

    <!-- 新增：修改密码弹窗 -->
    <el-dialog title="修改密码" :visible.sync="showChangePasswordDialog" width="400px">
      <el-form :model="changePasswordForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="changePasswordForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="changePasswordForm.password" placeholder="请输入新密码" type="password" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showChangePasswordDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitChangePassword">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { removeToken } from '@/utils/auth'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data() {
    return {
      showChangePasswordDialog: false,
      changePasswordForm: {
        username: '',
        password: ''
      }
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      removeToken();
      this.$router.push('/login')
    },
    submitChangePassword() {
      console.log('提交修改密码', this.changePasswordForm)
      // 这里可以加调用接口修改密码的逻辑
      this.$message.success('密码修改请求已发送！')
      this.showChangePasswordDialog = false
    }
  }
}
</script>
<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #ffffffd3;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgb(255, 254, 254)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;
    align-items: center;

    &:focus {
      outline: none;
    }

    .el-button {
      margin-left: 15px;
      padding: 0 12px;
      height: 36px;
      color: #393b3c;
      font-size: 14px;
      
      &:hover {
        color: #292727bd;
        background-color: rgba(150, 198, 247, 0.925);
      }
    }
  }
}
</style>


