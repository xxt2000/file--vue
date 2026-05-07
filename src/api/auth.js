import request from '@/utils/request' // 假设你封装了 axios

export const loginApi = (data) => {
    return request({
        url: '/api/login', // 你的后端登录接口地址
        method: 'post',
        data
    })
}
