// 引入 Pinia 的 defineStore 方法，用于定义状态管理仓库
import { defineStore } from 'pinia'
// 引入 Vue 的 ref 和 computed，用于创建响应式数据和计算属性
import { ref, computed } from 'vue'
// 1. 引入项目中封装好的 axios 实例
// 这个实例通常已经配置了 baseURL (如 '/api') 和拦截器 (如统一处理 Token)
import request from '@/utils/request' 

// 定义并导出一个名为 'user' 的 Store
// 使用 Setup Store 语法（函数式写法），比 Options Store 更灵活
export const useUserStore = defineStore('user', () => {
    // --- 状态定义 ---
    
    // 定义响应式变量 token，初始值尝试从 localStorage 中获取
    // 如果本地没有存储，则默认为空字符串
    const token = ref(localStorage.getItem('token') || '')
    
    // 定义响应式变量 userInfo，用于存储用户详细信息（如 ID、用户名、角色等）
    const userInfo = ref(null)

    // --- 初始化逻辑 ---
    
    // 页面刷新时，尝试从 localStorage 恢复之前保存的用户信息
    try {
        const userStr = localStorage.getItem('user')
        // 检查本地存储是否有数据，且数据不是字符串 'undefined'
        if (userStr && userStr !== 'undefined') {
            // 将 JSON 字符串解析回对象，赋值给 userInfo
            userInfo.value = JSON.parse(userStr)
        }
    } catch (e) {
        // 如果解析失败（例如 JSON 格式错误），在控制台输出错误并重置用户信息
        console.error('解析用户信息失败，已重置:', e)
        userInfo.value = null
    }

    // --- 方法/Action 定义 ---

    // 2. 定义登录方法：接收用户名和密码作为参数
    const login = async (username, password) => {
        try {
            // 使用封装好的 request 实例发送 POST 请求
            // 【路径说明】：请求 /users/login，对应后端接口 /api/users/login
            // request.js 中配置的 baseURL 会自动拼接在前面
            const res = await request.post('/users/login', {
            // 这里使用了 ES6（ECMAScript 2015）的对象属性简写语法。
            // 完整写法应该是：{ username: username, password: password }。
            // 简写规则：如果对象的属性名和变量名一模一样，就可以只写一个。
                username, 
                password
            })

            // --- 处理登录成功的逻辑 ---
            
            // 判断后端返回的 res 中是否包含 success: true 和 token 字段
            // 这里是根据具体的后端返回结构来写的
            if (res.success && res.token) {
                // 1. 将后端返回的 token 保存到响应式变量中
                token.value = res.token
                // 2. 将 token 持久化存储到浏览器 localStorage，防止刷新丢失
                localStorage.setItem('token', res.token)

                // 3. 保存用户详细信息
                // 检查返回数据中是否有 data 字段（通常包含 id, username, role 等）
                if (res.data) {
                    // 更新响应式状态
                    userInfo.value = res.data
                    // 将用户对象转换为 JSON 字符串存入 localStorage
                    localStorage.setItem('user', JSON.stringify(res.data))
                }

                // 返回成功状态对象，供组件调用处处理（如跳转页面）
                return { success: true, message: res.message || '登录成功' }
            } else {
                // --- 处理登录失败的业务逻辑（如密码错误） ---
                
                // 返回失败状态对象，并带上后端返回的错误信息
                return {
                    success: false,
                    message: res.message || '登录失败，请检查用户名和密码'
                }
            }

        } catch (error) {
            // --- 捕获网络请求层面的异常 ---
            
            console.error('登录请求异常:', error)

            // 尝试从错误对象中提取具体的错误信息
            // error.response?.data?.message：尝试获取 axios 响应拦截器处理后的后端报错
            // error.message：如果 axios 没拦截到，获取 JS 原生错误信息
            const errorMessage = error.response?.data?.message || error.message || '网络请求异常，请稍后重试'

            // 返回失败状态对象
            return {
                success: false,
                message: errorMessage
            }
        }
    }

    // 定义登出方法
    const logout = () => {
        // 1. 清空响应式状态
        token.value = ''
        userInfo.value = null
        
        // 2. 清空 localStorage 中的持久化数据
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        // 3. (可选) 如果后端有专门的登出接口（用于销毁服务端 Session），可以在这里调用
        // request.post('/users/logout').catch(err => console.log(err))
    }

    // --- 计算属性 ---

    // 定义一个计算属性 isAdmin，用于判断当前用户是否拥有管理员权限
    const isAdmin = computed(() => {
        // 逻辑：确保 userInfo 存在，并且其 role 属性严格等于 'admin'
        return userInfo.value && userInfo.value.role === 'admin'
    })

    // --- 返回暴露给外部使用的内容 ---
    
    return {
        token,      // 状态：Token
        userInfo,   // 状态：用户信息
        login,      // 方法：登录
        logout,     // 方法：登出
        isAdmin     // 计算属性：是否为管理员
    }
})
