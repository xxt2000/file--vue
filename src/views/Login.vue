<template>
  <!-- 登录页面的最外层容器，使用 flex 布局实现垂直水平居中 -->
  <div class="login-container">
    <!-- 登录卡片，包含所有登录相关内容 -->
    <div class="login-card">
      <!-- 登录页面的头部，包含图标、标题和提示文字 -->
      <div class="login-header">
        <!-- Element Plus 的图标组件，显示一个打开的文件夹图标 -->
        <el-icon :size="48"><FolderOpened /></el-icon>
        <!-- 系统标题 -->
        <h2>文件管理系统</h2>
        <!-- 提示文字 -->
        <p>请登录以继续</p>
      </div>

      <!-- 登录表单，绑定数据模型和验证规则 -->
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
        <!-- 用户名输入框 -->
        <el-form-item prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="用户名"
              :prefix-icon="User"
              size="large"
          />
        </el-form-item>

        <!-- 密码输入框 -->
        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              :prefix-icon="Lock"
              size="large"
              show-password
              @keyup.enter="handleLogin"
          />
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleLogin"
              style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 底部提示信息 -->
      <div class="login-tip">
        <p class="small">提示：后端服务需要先启动</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 引入 Vue 的 ref 函数，用于创建响应式数据
import { ref } from 'vue'
// 引入 Vue Router 的 useRouter，用于路由跳转
import { useRouter } from 'vue-router'
// 引入 Element Plus 的消息提示组件
import { ElMessage } from 'element-plus'
// 引入 Element Plus 的图标组件
import { User, Lock } from '@element-plus/icons-vue'
// 引入用户状态管理 store
import { useUserStore } from '@/stores/user'

// 获取路由实例
const router = useRouter()
// 获取用户状态管理实例
const userStore = useUserStore()

// 创建响应式数据，控制登录按钮的加载状态
const loading = ref(false)
// 创建表单引用，用于表单验证
const loginFormRef = ref()

// 创建响应式数据，存储登录表单的值
const loginForm = ref({
  username: '',
  password: ''
})

// 定义表单验证规则
const loginRules = {
  // 用户名验证规则：必填，失去焦点时触发验证
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  // 密码验证规则：必填，失去焦点时触发验证
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 处理登录的异步函数
const handleLogin = async () => {
  // 验证表单，如果验证不通过，会抛出错误
  await loginFormRef.value.validate()

  // 设置加载状态为 true，显示登录按钮的加载动画
  loading.value = true
  try {
    // 调用用户 store 的登录方法，传入用户名和密码
    const success = await userStore.login(loginForm.value.username, loginForm.value.password)
    // // 如果登录成功
    console.log('登录成功:', success.success)
    if (success.success) {
      ElMessage.success('登录成功')
      router.push('/')
    }
  } catch (error) {
    // 捕获异常，显示错误消息
    ElMessage.error('登录失败，请检查后端服务是否启动')
  } finally {
    // 无论成功或失败，都设置加载状态为 false，隐藏加载动画
    loading.value = false
  }
}
</script>

<style scoped>
/* 登录容器样式：全屏高度，使用 flex 布局实现垂直水平居中 */
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 使用渐变背景色 */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 登录卡片样式：固定宽度，内边距，白色背景，圆角和阴影 */
.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 16px;
  /* 添加阴影效果，使卡片浮起 */
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* 登录头部样式：居中对齐，底部外边距 */
.login-header {
  text-align: center;
  margin-bottom: 32px;
}

/* 标题样式：上下外边距，深灰色文字 */
.login-header h2 {
  margin: 16px 0 8px;
  color: #333;
}

/* 提示文字样式：灰色，小字体 */
.login-header p {
  color: #666;
  font-size: 14px;
}

/* 底部提示区域样式：顶部外边距，居中对齐，小字体，浅灰色 */
.login-tip {
  margin-top: 24px;
  text-align: center;
  font-size: 12px;
  color: #999;
}

/* 提示文字段落样式：上下外边距 */
.login-tip p {
  margin: 4px 0;
}

/* 小号文字样式：更小的字体，更浅的颜色 */
.small {
  font-size: 11px;
  color: #ccc;
}
</style>
