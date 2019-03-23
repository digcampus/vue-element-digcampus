import { loginByUsername, logout, getUserInfo } from '@/api/login'
import { Message } from 'element-ui'
import { getToken, setToken, removeToken } from '@/utils/auth'

const user = {
  state: {
    status: '',
    code: '',
    token: getToken(),
    admin: false,
    name: '',
    fid: '',
    uid: '',
    roles: [],
    avatar: '',
    introduction: '',
    msgcount: undefined,
    setting: {
      articlePlatform: []
    }
  },

  mutations: {
    SET_CODE: (state, code) => {
      state.code = code
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_INTRODUCTION: (state, introduction) => {
      state.introduction = introduction
    },
    SET_SETTING: (state, setting) => {
      state.setting = setting
    },
    SET_STATUS: (state, status) => {
      state.status = status
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_FID: (state, fid) => {
      state.fid = fid
    },
    SET_ADMIN: (state, admin) => {
      state.admin = admin
    },
    SET_UID: (state, uid) => {
      state.uid = uid
    },
    // 头像
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_MSGCOUNT: (state, msgcount) => {
      state.msgcount = msgcount
    },
    SET_SEMESTER: (state, semesterId) => {
      state.semesterId = semesterId
    }
  },

  actions: {
    // 用户名登录
    LoginByUsername({ commit }, userInfo) {
      const username = userInfo.username.trim()
      const fid = parseInt(userInfo.school.id)
      const role = parseInt(userInfo.role)
      const semesterId = parseInt(userInfo.school.semester.semesterId)
      return new Promise((resolve, reject) => {
        loginByUsername(username, userInfo.password, fid, role).then(response => {
          if (response.data.code === 200) {
            const data = response.data.result
            commit('SET_TOKEN', data.token)
            commit('SET_FID', fid)
            commit('SET_SEMESTER', semesterId)
            commit('SET_NAME', data.realname)
            commit('SET_MSGCOUNT', '')
            commit('SET_ADMIN', data.roles.includes(0))
            commit('SET_UID', data.uid)
            setToken(data.token)
            resolve()
          } else {
            Message({
              message: response.data.message,
              type: 'error',
              duration: 4 * 1000
            })
            resolve()
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetUserInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getUserInfo(state.token).then(response => {
          var data = response.data.result
          if (!data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('error')
          }

          if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
            commit('SET_ROLES', data.roles)
          } else {
            reject('getInfo: roles must be a non-null array !')
          }
          commit('SET_AVATAR', 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif')
          commit('SET_INTRODUCTION', '我是超级管理员')
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 第三方验证登录
    // LoginByThirdparty({ commit, state }, code) {
    //   return new Promise((resolve, reject) => {
    //     commit('SET_CODE', code)
    //     loginByThirdparty(state.status, state.email, state.code).then(response => {
    //       commit('SET_TOKEN', response.data.token)
    //       setToken(response.data.token)
    //       resolve()
    //     }).catch(error => {
    //       reject(error)
    //     })
    //   })
    // },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    },

    // 动态修改权限
    ChangeRoles({ commit, dispatch }, role) {
      return new Promise(resolve => {
        commit('SET_TOKEN', role)
        setToken(role)
        getUserInfo(role).then(response => {
          const data = response.data
          commit('SET_ROLES', data.roles)
          commit('SET_NAME', data.name)
          commit('SET_AVATAR', data.avatar)
          commit('SET_INTRODUCTION', data.introduction)
          dispatch('GenerateRoutes', data) // 动态修改权限后 重绘侧边菜单
          resolve()
        })
      })
    }
  }
}

export default user
