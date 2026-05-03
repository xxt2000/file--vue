<template>
  <div class="layout">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="logo">
        <el-icon>
          <FolderOpened/>
        </el-icon>
        <span>文件管理系统</span>
      </div>

      <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          @select="handleMenuSelect"
      >
        <!-- 全部文件入口 -->
        <el-menu-item index="all">
          <el-icon>
            <Files/>
          </el-icon>
          <span>全部文件</span>
        </el-menu-item>

        <el-divider style="margin: 10px 0;">我的文件夹</el-divider>

        <!-- 动态文件夹列表 -->
        <el-menu-item
            v-for="folder in folderList"
            :key="folder.id"
            :index="String(folder.id)"
        >
          <div class="folder-item-content">
            <!-- 左侧：图标和名称 (点击可进入) -->
            <div class="folder-info" @click.stop="handleMenuSelect(String(folder.id))">
              <el-icon>
                <Folder/>
              </el-icon>
              <span class="folder-name">{{ folder.name }}</span>
            </div>

            <!-- 右侧：操作按钮 (仅管理员可见) -->
            <div v-if="userStore.isAdmin" class="actions">
              <!-- 编辑按钮 -->
              <el-icon class="action-icon" @click.stop="handleEditFolder(folder)">
                <Edit/>
              </el-icon>
              <!-- 删除按钮 -->
              <el-icon class="action-icon delete" @click.stop="handleDeleteFolder(folder)">
                <Delete/>
              </el-icon>
            </div>
          </div>
        </el-menu-item>

        <!-- 添加文件夹按钮：仅管理员可见 -->
        <div v-if="userStore.isAdmin" style="padding: 10px;">
          <el-button size="small" style="width: 100%" @click="showAddFolderDialog">
            <el-icon>
              <Plus/>
            </el-icon>
            新建文件夹
          </el-button>
        </div>
      </el-menu>
    </div>

    <!-- 主内容区 -->
    <div class="main">
      <div class="header">
        <div class="breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-if="currentFolder">文件管理 / {{ currentFolder.name }}</el-breadcrumb-item>
            <el-breadcrumb-item v-else>文件管理 / 全部文件</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="user-info">
          <el-dropdown @command="handleCommand">
            <span class="user-name">
              {{ userStore.userInfo?.username || '用户' }}
              <el-icon><ArrowDown/></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="content">
        <!-- 传递 currentFolder 给子组件 -->
        <router-view v-slot="{ Component }">
          <component :is="Component" :current-folder="currentFolder"/>
        </router-view>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="400px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password/>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password/>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPassword">确认</el-button>
      </template>
    </el-dialog>
     <BigScreen />
  </div>
</template>

<script setup>
import BigScreen from '@/views/BigScreen.vue';
import {ref, onMounted, watch} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage, ElMessageBox} from 'element-plus'
import {useUserStore} from '@/stores/user'

import {getFolderList, createFolder, updateFolder, deleteFolder} from '@/api/file'

const router = useRouter()
const userStore = useUserStore()

// 状态管理
const activeMenu = ref('all') // 默认选中全部
const folderList = ref([]) // 文件夹列表
const currentFolder = ref(null) // 当前选中的文件夹对象
const passwordDialogVisible = ref(false)
const passwordFormRef = ref()

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  oldPassword: [{required: true, message: '请输入原密码', trigger: 'blur'}],
  newPassword: [{required: true, message: '请输入新密码', trigger: 'blur'}],
  confirmPassword: [
    {required: true, message: '请确认新密码', trigger: 'blur'},
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 获取文件夹列表
const fetchFolders = async () => {
  try {
    const res = await getFolderList()
    if (res.success) {
      folderList.value = res.data
    }
  } catch (error) {
    console.error('获取文件夹失败', error)
  }
}

// 处理菜单选择 (点击文件夹名称时触发)
const handleMenuSelect = (index) => {
  activeMenu.value = index
  if (index === 'all') {
    currentFolder.value = null // 表示查看所有文件
  } else {
    // 找到对应的文件夹对象
    const folder = folderList.value.find(f => String(f.id) === index)
    currentFolder.value = folder || null
  }
}

// 【新增】处理编辑文件夹点击
const handleEditFolder = (folder) => {
  ElMessageBox.prompt('请输入新的文件夹名称', '编辑文件夹', {
    confirmButtonText: '保存',
    cancelButtonText: '取消',
    inputValue: folder.name,
    inputPattern: /\S/,
    inputErrorMessage: '文件夹名称不能为空'
  }).then(async ({value}) => {
    if (!value || value === folder.name) return

    try {
      await updateFolder(folder.id, {name: value})
      ElMessage.success('重命名成功')
      fetchFolders()

      // 如果当前正在查看这个文件夹，更新面包屑显示的名称
      if (currentFolder.value && currentFolder.value.id === folder.id) {
        currentFolder.value.name = value
      }
    } catch (error) {
      console.error('更新文件夹失败', error)
    }
  }).catch(() => {})
}

// 【新增】处理删除文件夹点击
const handleDeleteFolder = (folder) => {
  ElMessageBox.confirm(
      `确定要删除文件夹 "${folder.name}" 吗？如果文件夹内有文件，它们也会被删除。`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(async () => {
    try {
      await deleteFolder(folder.id)
      ElMessage.success('删除成功')

      // 如果删除的是当前正在查看的文件夹，跳回“全部文件”
      if (currentFolder.value && currentFolder.value.id === folder.id) {
        handleMenuSelect('all')
      }

      fetchFolders()
    } catch (error) {
      console.error('删除文件夹失败', error)
    }
  }).catch(() => {})
}

// 监听 currentFolder 的变化
watch(currentFolder, (newVal, oldVal) => {
  console.log('Layout: 文件夹切换了', oldVal?.name, '->', newVal?.name)
})

// 新建文件夹
const showAddFolderDialog = () => {
  ElMessageBox.prompt('请输入文件夹名称', '新建文件夹', {
    confirmButtonText: '创建',
    cancelButtonText: '取消',
  }).then(async ({value}) => {
    if (!value) return
    await createFolder({name: value})
    ElMessage.success('创建成功')
    fetchFolders()
  }).catch(() => {
  })
}

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  } else if (command === 'password') {
    passwordDialogVisible.value = true
  }
}

const submitPassword = async () => {
  await passwordFormRef.value.validate()
  try {
    await changePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })
    ElMessage.success('密码修改成功，请重新登录')
    passwordDialogVisible.value = false
    userStore.logout()
    router.push('/login')
  } catch (error) {
    // 错误已在拦截器中处理
  }
}

onMounted(() => {
  fetchFolders()
})
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #e4e7ed;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

/* 文件夹条目容器 */
.folder-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 两端对齐：名称在左，按钮在右 */
  width: 100%;
  height: 100%;
  padding-right: 10px; /* 给右侧按钮留点空隙 */
  box-sizing: border-box;
}

/* 左侧信息区 */
.folder-info {
  display: flex;
  align-items: center;
  flex: 1; /* 占据剩余空间 */
  overflow: hidden; /* 防止名称过长撑开 */
  cursor: pointer;
}

.folder-name {
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 右侧操作区 */
.actions {
  display: flex;
  gap: 5px; /* 按钮之间的间距 */
  opacity: 0; /* 默认隐藏，鼠标悬停时显示 */
  transition: opacity 0.2s;
}

/* 鼠标悬停在菜单项上时显示操作按钮 */
.el-menu-item:hover .actions {
  opacity: 1;
}

.action-icon {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 16px;
}

.action-icon:hover {
  background-color: #f0f0f0;
}

.action-icon.delete:hover {
  color: #F56C6C; /* 删除按钮悬停变红 */
  background-color: #fef0f0;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5f7fa;
}

.header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.breadcrumb {
  font-size: 14px;
}

.user-name {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}
</style>
