import { createRouter, createWebHistory } from 'vue-router'
// 注意：这里不要直接解构 useUserStore，而是在守卫内部调用
import { useUserStore } from '@/stores/user'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/',
        component: () => import('@/layouts/Layout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'FileManage',
                component: () => import('@/views/FileManage.vue'),
                meta: { title: '文件管理' }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    // 1. 尝试获取 store
    const userStore = useUserStore()

    // 2. 【关键修改】检查 token 是否存在
    // 如果你的 store 没有持久化插件，这里 userStore.token 可能永远是刷新后的初始值
    // 假设你的 token 是保存在 localStorage 中的，这里做一个双重保险
    // 这样即使 store 还没初始化好，也能从 localStorage 读到状态
    const token = userStore.token || localStorage.getItem('token')

    const requiresAuth = to.meta.requiresAuth !== false

    if (requiresAuth && !token) {
        // 需要登录但没有 token -> 跳转登录
        next('/login')
    } else if (to.path === '/login' && token) {
        // 已登录但访问登录页 -> 跳转首页
        next('/')
    } else {
        next()
    }
})

export default router
