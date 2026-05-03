import request from '@/utils/request'

// 获取文件列表
export const getFileList = (params) => {
    return request({
        url: '/files',
        method: 'get',
        params: params
    })
}

// 上传文件
export const uploadFile = (formData) => {
    return request({
        url: '/upload',
        method: 'post',
        data: formData
    })

}

// 删除文件
export const deleteFile = (id) => {
    return request({
        url: '/files/' + id,
        method: 'delete'
    })
}

// 更新文件信息
export const updateFile = (id, data) => {
    return request({
        url: '/files/' + id,
        method: 'put',
    })
}

// 批量删除文件
export const batchDeleteFiles = (ids) => {
    return request({
        url: '/files',
        method: 'delete',
        params: ids
    })
}

// 下载文件
export const downloadFile = (id, filename) => {
    return request.get(`/files/${id}/download`, {
        responseType: 'blob',
        params: { filename }
    }).then(res => {
        const url = window.URL.createObjectURL(new Blob([res]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    })
}

// ================= 新增部分 (必须包含) =================

// 获取文件夹列表
export const getFolderList = () => {
    return request.get('/files/folders')
}

// 创建文件夹
export const createFolder = (data) => {
    return request.post('/files/folders', data)
}


// 【新增】更新文件夹名称 (用于编辑功能)
// 对应后端路由: PUT /api/files/folders/:id
export const updateFolder = (id, data) => {
    return request.put(`/files/folders/${id}`, data)
}

// 【新增】删除文件夹 (可选，用于管理功能)
// 对应后端路由: DELETE /api/files/folders/:id
export const deleteFolder = (id) => {
    return request.delete(`/files/folders/${id}`)
}