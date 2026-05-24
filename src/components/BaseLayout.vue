<template>
  <div class="layout-container">

    <!-- 左侧栏 -->
    <div class="sidebar">

      <div class="logo">
        设备管理系统
      </div>

      <el-menu
        :default-active="$route.path"
        router
        background-color="#0f172a"
        text-color="#ffffff"
        active-text-color="#409EFF"
        class="sidebar-menu"
      >

        <!-- 一级菜单循环 -->
        <template v-for="item in menus">

          <!-- ================= 有子菜单 ================= -->
          <el-submenu
            v-if="item.children && item.children.length"
            :index="item.path"
            :key="item.path"
          >

            <!-- 一级菜单标题 -->
            <template slot="title">

              <i :class="item.icon"></i>

              <span>
                {{ item.title }}
              </span>

            </template>

            <!-- 二级菜单 -->
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="child.path"
            >

              {{ child.title }}

            </el-menu-item>

          </el-submenu>

          <!-- ================= 普通一级菜单 ================= -->
          <el-menu-item
            v-else
            :key="item.path"
            :index="item.path"
          >

            <i :class="item.icon"></i>

            <span slot="title">
              {{ item.title }}
            </span>

          </el-menu-item>

        </template>

      </el-menu>

    </div>

    <!-- 右侧 -->
    <div class="main-area">

      <!-- 顶栏 -->
      <div class="navbar">

        <div class="navbar-left">
          {{ systemTitle }}
        </div>

        <div class="navbar-right">
          {{ pageTitle }}
        </div>

      </div>

      <!-- 内容 -->
      <div class="app-main">
        <router-view />
      </div>

    </div>

  </div>
</template>

<script>
export default {
  name: 'BaseLayout',

  props: {

    menus: {
      type: Array,
      default: () => []
    },

    systemTitle: {
      type: String,
      default: '设备管理系统'
    },

    pageTitle: {
      type: String,
      default: ''
    }

  }
}
</script>

<style scoped>

.layout-container {
  display: flex;
  height: 100vh;
}

/* ================= 左侧栏 ================= */

.sidebar {
  width: 220px;
  background: #0f172a;
  overflow-y: auto;
}

.logo {
  height: 60px;
  color: white;
  font-size: 22px;
  font-weight: bold;

  display: flex;
  justify-content: center;
  align-items: center;

  border-bottom: 1px solid #1e293b;
}

/* 菜单 */

.sidebar-menu {
  border-right: none;
}

/* 修复 submenu 背景 */

::v-deep .el-submenu__title {
  color: #ffffff !important;
}

::v-deep .el-submenu__title:hover {
  background-color: #1e293b !important;
}

::v-deep .el-menu-item {
  background-color: #0f172a !important;
}

::v-deep .el-menu-item:hover {
  background-color: #1e293b !important;
}

::v-deep .el-submenu .el-menu-item {
  background-color: #111827 !important;
  padding-left: 50px !important;
}

/* ================= 右侧 ================= */

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

/* ================= 顶栏 ================= */

.navbar {
  height: 60px;
  background: #1e3a8a;
  color: white;

  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 0 30px;

  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.navbar-left {
  font-size: 22px;
  font-weight: bold;
}

.navbar-right {
  font-size: 18px;
}

/* ================= 主体 ================= */

.app-main {
  flex: 1;
  padding: 25px;
  overflow-y: auto;
}

</style>
