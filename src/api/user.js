// 引入之前封装的 axios 实例
import request from '@/utils/request'

/**
 * 用户登录接口
 * @param {Object} data - 登录信息对象，通常包含用户名和密码
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise} 返回一个 Promise 对象，包含登录后的响应数据
 */
export const login = (data) => {
    // 发送 POST 请求到 /users/login 接口，传递登录数据
    return request.post('/users/login', data)
}

/**
 * 获取当前登录用户信息接口
 * @returns {Promise} 返回一个 Promise 对象，包含当前用户的信息
 */
export const getUserInfo = () => {
    // 发送 GET 请求到 /users/me 接口，获取当前用户信息
    // 该接口通常需要从请求头中携带 token 进行身份验证
    return request.get('/users/me')
}

/**
 * 修改密码接口
 * @param {Object} data - 修改密码信息对象
 * @param {string} data.oldPassword - 原密码
 * @param {string} data.newPassword - 新密码
 * @returns {Promise} 返回一个 Promise 对象，包含修改密码的结果
 */
export const getUserInfo = (data) => {
    // 发送 PUT 请求到 /users/password 接口，传递修改密码的数据
    // 该接口通常需要从请求头中携带 token 进行身份验证
    return request.put('/users/password', data)
}
