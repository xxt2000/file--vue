<template xmlns="">
  <div class="file-manage">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
          v-model="searchParams.keyword"
          placeholder="搜索文件名或描述"
          clearable
          style="width: 300px"
          @clear="fetchFiles"
          @input="fetchFiles"
      >
        <template #prefix>
          <el-icon>
            <Search/>
          </el-icon>
        </template>
      </el-input>

      <!-- 如果在特定文件夹下，隐藏分类筛选 -->
      <el-select v-if="!currentFolder" v-model="searchParams.category" placeholder="选择分类" clearable style="width: 150px"
                 @change="fetchFiles">
        <el-option label="图片" value="图片"/>
        <el-option label="配置文件" value="配置文件"/>
        <el-option label="脚本工具" value="脚本工具"/>
        <el-option label="文档" value="文档"/>
      </el-select>

      <el-button type="primary" @click="fetchFiles">
        <el-icon>
          <Search/>
        </el-icon>
        搜索
      </el-button>

      <!-- 【修改】只有管理员才能看到“上传文件”按钮 -->
      <el-button
          v-if="userStore.isAdmin"
          type="success"
          @click="uploadDialogVisible = true"
      >
        <el-icon>
          <Upload/>
        </el-icon>
        上传文件
      </el-button>

      <!-- 批量删除通常也只有管理员需要，这里也加上判断 -->
      <el-button
          v-if="selectedRows.length > 0 && userStore.isAdmin"
          type="danger"
          @click="batchDelete"
      >
        批量删除 ({{ selectedRows.length }})
      </el-button>
    </div>

    <!-- 文件列表 -->
    <el-table
        :data="fileList"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55"/>
      <el-table-column prop="filename" label="文件名" min-width="200" show-overflow-tooltip/>
      <el-table-column prop="version" label="版本" width="100"/>
      <el-table-column prop="category" label="分类" width="120">
        <template #default="{ row }">
          <el-tag :type="getCategoryType(row.category)">{{ row.category }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="file_size" label="大小" width="100">
        <template #default="{ row }">
          {{ formatFileSize(row.file_size) }}
        </template>
      </el-table-column>
      <el-table-column prop="download_count" label="下载次数" width="100"/>
      <el-table-column prop="uploader" label="上传人" width="120"/>
      <el-table-column prop="created_at" label="上传时间" width="180"/>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="downloadFile(row)">
            <el-icon>
              <Download/>
            </el-icon>
            下载
          </el-button>

          <!-- 编辑按钮：仅管理员可见 -->
          <el-button
              v-if="userStore.isAdmin"
              link
              type="warning"
              @click="editFile(row)"
          >
            <el-icon>
              <Edit/>
            </el-icon>
            编辑
          </el-button>

          <!-- 删除按钮：仅管理员可见 -->
          <el-button
              v-if="userStore.isAdmin"
              link
              type="danger"
              @click="deleteFile(row.id)"
          >
            <el-icon>
              <Delete/>
            </el-icon>
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="fetchFiles"
          @size-change="fetchFiles"
      />
    </div>

    <!-- 上传对话框 -->
    <el-dialog
        v-model="uploadDialogVisible"
        title="上传文件"
        width="500px"
        @closed="handleDialogClosed"
    >
      <el-form :model="uploadForm" label-width="100px">

        <!-- 当前文件夹显示 -->
        <el-form-item label="当前文件夹">
          <el-tag v-if="currentFolder" type="success">{{ currentFolder.name }}</el-tag>
          <span v-else style="color: #999;">根目录 (全部文件)</span>
        </el-form-item>

        <!-- 选择文件 -->
        <el-form-item label="选择文件" required>
          <el-upload
              ref="uploadRef"
              :auto-upload="false"
              :on-change="handleFileChange"
              :limit="1"
              drag
          >
            <el-icon class="el-icon--upload">
              <UploadFilled/>
            </el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或 <em>点击上传</em>
            </div>
          </el-upload>
        </el-form-item>

        <!-- 版本号 -->
        <el-form-item label="版本号">
          <el-input
              v-model="uploadForm.version"
              placeholder="如 v1.0.0"
              @keyup.enter="triggerUpload"
          />
        </el-form-item>

        <!-- 分类选择 -->
        <el-form-item label="分类">
          <el-select v-model="uploadForm.category" placeholder="请选择分类">
            <el-option label="图片" value="图片"/>
            <el-option label="配置文件" value="配置文件"/>
            <el-option label="脚本工具" value="脚本工具"/>
            <el-option label="文档" value="文档"/>
          </el-select>
        </el-form-item>

        <!-- 描述 -->
        <el-form-item label="描述">
          <el-input
              v-model="uploadForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入文件描述"
              @keyup.enter="triggerUpload"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button
            ref="uploadSubmitBtnRef"
            type="primary"
            :loading="uploading"
            @click="submitUpload"
        >
          确认上传
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑文件信息" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="版本号">
          <el-input v-model="editForm.version"/>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="editForm.category">
            <el-option label="图片" value="图片"/>
            <el-option label="配置文件" value="配置文件"/>
            <el-option label="脚本工具" value="脚本工具"/>
            <el-option label="文档" value="文档"/>
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, watch, nextTick} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {
  getFileList,
  uploadFile,
  deleteFile as deleteFileApi,
  updateFile,
  batchDeleteFiles,
  downloadFile as downloadFileApi
} from '@/api/file'
import {useUserStore} from '@/stores/user'
import {useFileStore} from '@/stores/file'

// 接收父组件传递的 currentFolder
const props = defineProps({
  currentFolder: {
    type: Object,
    default: null
  }
})

const userStore = useUserStore()

// 数据
const fileList = ref([])
const selectedRows = ref([])
const uploading = ref(false)

// 搜索参数
const searchParams = reactive({
  keyword: '',
  category: ''
})

// 分页
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

// 对话框
const uploadDialogVisible = ref(false)
const editDialogVisible = ref(false)
const uploadRef = ref()
const uploadSubmitBtnRef = ref()
const selectedFile = ref(null)

const uploadForm = reactive({
  version: '1.0.0',
  category: '图片',
  description: ''
})

const editForm = reactive({
  id: null,
  version: '',
  category: '',
  description: ''
})

// 触发上传按钮点击的函数
const triggerUpload = () => {
  if (uploadSubmitBtnRef.value && !uploading.value) {
    uploadSubmitBtnRef.value.$el.click()
  }
}

// 获取文件列表
const fetchFiles = async () => {
  try {
    console.log('--- 开始获取文件列表 ---')
    console.log('当前文件夹 ID:', props.currentFolder?.id)
    console.log('当前文件夹名称:', props.currentFolder?.name)

    const params = {
      page: pagination.page,
      limit: pagination.limit,
      keyword: searchParams.keyword,
      category: searchParams.category,
      folder_id: props.currentFolder ? props.currentFolder.id : undefined
    }

    console.log('发送请求参数:', params)

    const res = await getFileList(params)

    console.log('【后端完整返回】: ', res)
    console.log('success 状态:', res.success)
    console.log('data 数据:', res.data)
    console.log('pagination 数据:', res.pagination)

    // 【修改】增加容错判断：即使 res.success 不是 true，只要有 data 就显示
    if (res && res.data) {
      fileList.value = res.data
      pagination.total = res.pagination ? res.pagination.total : 0
      console.log('✅ 列表已更新，当前条数:', fileList.value.length)
    } else {
      console.warn('⚠️ 后端返回数据格式异常或为空')
      // 如果数据为空，手动清空列表
      fileList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('❌ 获取文件列表失败:', error)
  }
}

// 【关键】监听 currentFolder 的变化，一旦切换文件夹，立即刷新列表
watch(() => props.currentFolder, (newVal, oldVal) => {
  console.log('>>> Watch 触发: 文件夹切换')
  console.log('旧值:', oldVal)
  console.log('新值:', newVal)

  // 1. 切换文件夹时，重置页码到第一页
  pagination.page = 1

  // 2. 重新获取文件列表
  fetchFiles()
})

// 下载文件
const downloadFile = async (row) => {
  try {
    // 调用下载API
    await downloadFileApi(row.id, row.filename)

    // 立即更新本地数据中的下载次数
    const fileIndex = fileList.value.findIndex(item => item.id === row.id)
    if (fileIndex !== -1) {
      fileList.value[fileIndex].download_count += 1
    }

    ElMessage.success('开始下载')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败')
  }
}

// 删除文件
const deleteFile = (id) => {
  ElMessageBox.confirm('确定删除该文件吗？删除后无法恢复。', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteFileApi(id)
    ElMessage.success('删除成功')
    fetchFiles()
  }).catch(() => {
  })
}

// 批量删除
const batchDelete = () => {
  const ids = selectedRows.value.map(row => row.id)
  ElMessageBox.confirm(`确定删除选中的 ${ids.length} 个文件吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await batchDeleteFiles(ids)
    ElMessage.success('删除成功')
    selectedRows.value = []
    fetchFiles()
  }).catch(() => {
  })
}

// 编辑文件
const editFile = (row) => {
  editForm.id = row.id
  editForm.version = row.version
  editForm.category = row.category
  editForm.description = row.description
  editDialogVisible.value = true
}

// 提交编辑
const submitEdit = async () => {
  await updateFile(editForm.id, {
    version: editForm.version,
    category: editForm.category,
    description: editForm.description
  })
  ElMessage.success('更新成功')
  editDialogVisible.value = false
  fetchFiles()
}

// 选择文件
const handleFileChange = (file) => {
  selectedFile.value = file.raw
}

// 打开上传对话框
const openUploadDialog = () => {
  uploadDialogVisible.value = true
}

// 处理对话框关闭事件，重置状态
const handleDialogClosed = () => {
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
  selectedFile.value = null
  uploadForm.version = '1.0.0'
  uploadForm.category = '图片'
  uploadForm.description = ''
}

// 上传文件
const submitUpload = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择文件')
    return
  }

  uploading.value = true
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  formData.append('version', uploadForm.version)
  formData.append('category', uploadForm.category)
  formData.append('description', uploadForm.description)
  formData.append('uploader', userStore.userInfo?.username || 'unknown')

  // 【关键】如果当前有选中的文件夹，传递 folder_id
  if (props.currentFolder) {
    formData.append('folder_id', props.currentFolder.id)
  }

  try {
    await uploadFile(formData)
    ElMessage.success('上传成功')
    uploadDialogVisible.value = false
    fetchFiles()
  } catch (error) {
    console.error('上传失败', error)
  } finally {
    uploading.value = false
  }
}

// 表格选中
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return '-'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

// 获取分类标签类型
const getCategoryType = (category) => {
  const types = {
    '图片': 'danger',
    '配置文件': 'warning',
    '脚本工具': 'success',
    '文档': 'info'
  }
  return types[category] || 'primary'
}

onMounted(() => {
  fetchFiles()
})
</script>

<style scoped>
.file-manage {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  min-height: calc(100vh - 120px);
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
