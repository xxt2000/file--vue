// src/store/file.js
import { defineStore } from 'pinia'

export const useFileStore = defineStore('file', {
    // 1. 状态：定义 currentFolder
    currentFolder: {
        type: Object,
        default: null
    },

    // 2. 动作：定义修改 currentFolder 的方法

    // 设置当前文件夹
    setCurrentFolder(folder) {
        this.currentFolder = folder
    },

    // 可选：清空当前文件夹（回到根目录）
    clearCurrentFolder() {
        this.currentFolder = null
    }

})
