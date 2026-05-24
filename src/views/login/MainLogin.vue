<template>
  <div class="page">

    <!-- 背景装饰 -->
    <div class="bg"></div>

    <!-- 中心卡片 -->
    <div class="card">

      <div class="title">实验室设备管理系统</div>
      <div class="subtitle">请选择登录入口</div>

      <div class="btn-group">

        <div class="entry-card" @click="goVisitor">
          <div class="icon">👤</div>
          <div class="label">访客入口</div>
          <div class="desc">学生 / 教师 / 校外人员</div>
        </div>

        <div class="entry-card admin" @click="goAdmin">
          <div class="icon">⚙️</div>
          <div class="label">管理入口</div>
          <div class="desc">设备管理员 / 实验室负责人</div>
        </div>

      </div>

    </div>

  </div>
</template>

<script>
export default {
  name: 'MainLogin',

  methods: {
    goVisitor() {
      this.$router.push('/visitor-login')
    },
    goAdmin() {
      this.$router.push('/admin-login')
    }
  }
}
</script>

<style scoped>
.page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0f172a;
  overflow: hidden;
  position: relative;
}

/* 背景光效 */
.bg {
  position: absolute;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(59,130,246,0.35), transparent 60%);
  top: -200px;
  left: -200px;
  filter: blur(60px);
}

.card {
  width: 520px;
  padding: 40px;
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 18px;
  text-align: center;
  color: #fff;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}

.title {
  font-size: 26px;
  font-weight: 600;
  letter-spacing: 2px;
}

.subtitle {
  margin-top: 8px;
  font-size: 14px;
  color: rgba(255,255,255,0.6);
}

.btn-group {
  margin-top: 30px;
  display: flex;
  gap: 20px;
  justify-content: center;
}

.entry-card {
  flex: 1;
  padding: 22px;
  border-radius: 14px;
  background: rgba(255,255,255,0.08);
  cursor: pointer;
  transition: 0.3s;
  border: 1px solid rgba(255,255,255,0.1);
}

.entry-card:hover {
  transform: translateY(-6px);
  background: rgba(255,255,255,0.12);
}

.entry-card.admin {
  background: rgba(59,130,246,0.15);
}

.icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.label {
  font-size: 16px;
  font-weight: 600;
}

.desc {
  font-size: 12px;
  margin-top: 6px;
  color: rgba(255,255,255,0.6);
}
</style>
