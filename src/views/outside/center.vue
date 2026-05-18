<template>
  <div class="outer-page">

    <!-- ===== 顶部导航栏 ===== -->


    <!-- ===== 主布局 ===== -->
    <div class="layout">

      <!-- ===== 左侧菜单 ===== -->


      <!-- ===== 主内容区 ===== -->
      <div class="content">

        <div class="title">校外人员个人中心</div>
        <div class="desc">查看与修改个人信息</div>

        <!-- 信息表格 -->
        <el-card class="card">

          <el-form label-width="120px">

            <el-form-item label="编号">
              <el-input v-model="form.id" disabled />
            </el-form-item>

            <el-form-item label="姓名">
              <el-input v-model="form.name" disabled />
            </el-form-item>

            <el-form-item label="性别">
              <el-input v-model="form.gender" disabled />
            </el-form-item>

            <el-form-item label="所在单位名称">
              <el-input v-model="form.company" disabled />
            </el-form-item>

            <el-form-item label="扩展字段">
              <el-input v-model="form.extra" disabled />
            </el-form-item>

          </el-form>

          <!-- 按钮 -->
          <div class="btns">

            <el-button @click="goLogin">
              返回登录页面
            </el-button>

            <el-button type="primary" @click="editDialog = true">
              修改个人信息
            </el-button>

          </div>

        </el-card>

      </div>
    </div>

    <!-- ========================= -->
    <!-- ===== 界面2：编辑弹窗 ===== -->
    <!-- ========================= -->

    <el-dialog
      title="校外人员信息编辑"
      :visible.sync="editDialog"
      width="500px"
    >

      <el-form label-width="100px">

        <el-form-item label="编号">
          <el-input v-model="editForm.id" />
        </el-form-item>

        <el-form-item label="姓名">
          <el-input v-model="editForm.name" />
        </el-form-item>

        <el-form-item label="性别">
          <el-select v-model="editForm.gender" style="width:100%">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>

        <el-form-item label="单位名称">
          <el-input v-model="editForm.company" />
        </el-form-item>

        <el-form-item label="扩展字段">
          <el-input v-model="editForm.extra" />
        </el-form-item>

      </el-form>

      <div slot="footer">

        <el-button @click="editDialog=false">
          取消
        </el-button>

        <el-button type="primary" @click="save">
          保存信息并返回
        </el-button>

      </div>

    </el-dialog>

  </div>
</template>

<script>
export default {
  name: 'ExternalCenter',

  data() {
    return {

      editDialog: false,

      form: {
        id: 'W2024001',
        name: '李四',
        gender: '男',
        company: '某某研究院',
        extra: '无'
      },

      editForm: {}
    }
  },

  mounted() {
    this.editForm = { ...this.form }
  },

  methods: {

    // 返回登录
    goLogin() {
      this.$router.push('/')
    },

    // 打开编辑时复制数据
    openEdit() {
      this.editForm = { ...this.form }
      this.editDialog = true
    },

    // 保存
    save() {

      this.form = { ...this.editForm }

      this.$message.success('信息保存成功')

      this.editDialog = false
    }
  }
}
</script>

<style scoped>

.outer-page {
  background: #f5f7fa;
  min-height: 100vh;
}

/* 顶栏 */
.top-bar {
  background: #409eff;
  color: white;
  display: flex;
  justify-content: space-between;
  padding: 14px 20px;
}

/* layout */
.layout {
  display: flex;
}

/* sidebar */
.sidebar {
  width: 200px;
  background: #fff;
  min-height: 100vh;
  border-right: 1px solid #eee;
}

.menu {
  padding: 14px;
  cursor: pointer;
  color: #606266;
}

.menu i {
  margin-right: 6px;
}

.active {
  background: #ecf5ff;
  color: #409eff;
}

/* content */
.content {
  flex: 1;
  padding: 30px;
}

.title {
  font-size: 26px;
  font-weight: bold;
}

.desc {
  color: #909399;
  margin-bottom: 20px;
}

/* card */
.card {
  padding: 20px;
  border-radius: 12px;
}

/* buttons */
.btns {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
}
</style>
