// 引入 axios 库，用于发送 HTTP 请求
import axios from 'axios'
// 引入 Element Plus 的消息提示组件，用于显示错误信息
import { ElMessage } from 'element-plus'

// 创建 axios 实例，进行全局配置
const request = axios.create({
    // 设置基础 URL，所有请求都会自动拼接这个前缀
    baseURL: '/api',
    // 设置请求超时时间为 60 秒
    timeout: 60000,
})

// 请求拦截器：在发送请求之前对请求配置进行处理
request.interceptors.request.use(
    // 成功回调函数，接收请求配置对象
    (config) => {
        // 从本地存储中获取 token（通常用于身份验证）
        const token = localStorage.getItem('token')
        // 如果 token 存在，则将其添加到请求头的 Authorization 字段中
        // 使用 Bearer 认证方案，格式为 "Bearer {token}"
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        // 返回处理后的配置对象，继续发送请求
        return config
    },
    // 失败回调函数，处理请求配置错误
    (error) => {
        // 将错误传递给后续的错误处理
        return Promise.reject(error)
    }
)

// 响应拦截器：在收到响应后对响应数据进行处理
request.interceptors.response.use(
    // 成功回调函数，接收响应对象
    (response) => {
        // 直接返回响应数据部分，简化后续处理
        return response.data
    },
    // 失败回调函数，处理响应错误
    (error) => {
        // 检查错误对象中是否有响应对象（即服务器返回了错误响应）
        if (error.response) {
            // 解构获取响应状态码和响应数据
            const { status, data } = error.response
            // 根据不同的状态码显示不同的错误信息
            switch (status) {
                // 401 未授权：登录已过期
                case 401:
                    ElMessage.error('登录已过期，请重新登录')
                    // 清除本地存储的 token 和用户信息
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    // 跳转到登录页面
                    window.location.href = '/login'
                    break
                // 403 禁止访问：没有权限执行此操作
                case 403:
                    ElMessage.error('没有权限执行此操作')
                    break
                // 404 未找到：请求的资源不存在
                case 404:
                    ElMessage.error('请求的资源不存在')
                    break
                // 500 服务器内部错误
                case 500:
                    ElMessage.error('服务器错误，请稍后重试')
                    break
                // 其他状态码：显示服务器返回的错误信息或默认错误信息
                default:
                    ElMessage.error(data?.error || data?.message || '请求失败')
            }
        } 
        // 请求超时错误（ECONNABORTED 是 axios 定义的请求超时错误码）
        else if (error.code === 'ECONNABORTED') {
            ElMessage.error('请求超时，请检查网络连接')
        } 
        // 网络错误（如无法连接到服务器）
        else if (error.message === 'Network Error') {
            ElMessage.error('无法连接到后端服务，请确保后端已启动')
        } 
        // 其他未知错误
        else {
            ElMessage.error('请求失败: ' + error.message)
        }
        // 将错误传递给后续的错误处理
        return Promise.reject(error)
    }
)

// 导出封装好的 axios 实例，供其他模块使用
export default request
