<template>
  <div class="createPost-container">
    <el-form ref="article" :model="article" :rules="rules">
      <sticky :class-name="'sub-navbar draft'">
        <CommentDropdown v-model="article.upload" />
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="publish()">发布
        </el-button>
        <el-button v-loading="loading" type="warning" @click="saveUEContent(0)">保存</el-button>
      </sticky>
      <el-form-item label="标题" style="margin-bottom:12px;" label-width="120px" prop="title">
        <el-col :span="12">
          <el-input v-model="article.title" :rows="1" :minlength="4" :maxlength="50" type="text" placeholder="请输入标题(少于50字)" style="width:80%;"/>
        </el-col>
        <el-col :span="1" class="line">收件人</el-col>
        <el-col :span="11">
          <el-button type="success" size="mini" @click="showSelectUser">收件人</el-button>
        </el-col>
      </el-form-item>
      <el-form-item label="发布者" style="margin-bottom:12px;" label-width="120px">
        <el-col :span="12">
          <el-input v-model="article.publishUser" :rows="1" :maxlength="50" type="text" style="width:80%;"/>
        </el-col>
        <el-col :span="1" class="line">所属模块</el-col>
        <el-col :span="11">
          <el-cascader
            v-model="articleModuleList"
            :options="moduleList"
            :props="props"
            placeholder="所属模块"
            clearable="true"
            expand-trigger="hover"
            style="width: 80%;"
            @change="handleChange"/>
        </el-col>
      </el-form-item>
      <div class="createPost-main-container">
        <el-form-item prop="content" style="margin-top:-10px;">
          <div style="margin-left:15px;margin-right:25px;line-height:0px;margin-bottom:20px;">
            <vue-ueditor-wrap ref="ueditor" :config="defaultConfig" v-model="article.content" style="margin-bottom:20px;" @ready="ready"/>
          </div>
        </el-form-item>
      </div>
    </el-form>

    <el-dialog :visible.sync="dialogFormVisible" title="收件人">
      <el-button :disabled="(article.receiverList.length>0 && selectIndex && selectIndex != 1) || selectTeacher || selectStudent" type="info" plain size="mini" style="margin-top:-150px;" @click="selectUser(1)">
        添加教师或学生
      </el-button>
      <el-button :disabled="(article.receiverList.length>0 && selectIndex && selectIndex != 2) || selectTeacher || selectStudent" type="info" plain size="mini" style="margin-top:-150px;" @click="selectUser(2)">
        添加班级
      </el-button>
      <el-button :disabled="(article.receiverList.length>0 && selectIndex && selectIndex != 3) || selectTeacher || selectStudent" type="info" plain size="mini" style="margin-top:-150px;" @click="selectUser(3)">
        添加群组
      </el-button>
      <el-checkbox v-model="selectTeacher" :disabled="article.receiverList.length>0 && selectIndex && selectIndex < 4" class="filter-item" style="margin-left:15px;" @change="selectIndex=4">全体老师</el-checkbox>
      <el-checkbox v-model="selectStudent" :disabled="article.receiverList.length>0 && selectIndex && selectIndex < 4" class="filter-item" @change="selectIndex=5">全体学生</el-checkbox>
      <el-table
        :data="article.attachmentList"
        :height="300"
        border
        style="width:100%;overflow:auto;">
        <el-table-column :label="$t('id')" align="center" min-width="10%">
          <template slot-scope="scope">
            <span>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="名称" min-width="30%" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.realname }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" min-width="30%" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.roles[0]==1">教师</span>
            <span v-if="scope.row.roles[0]==2">学生</span>
            <span v-if="scope.row.roles[0]==3">群组</span>
          </template>
        </el-table-column>
        <el-table-column v-if="!disabled" :label="$t('table.actions')" align="center" min-width="30%" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button type="danger" size="mini" @click="handleDeleteUser(scope.$index)">{{ $t('delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogFormVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>

    <showUser v-if="hackReset" ref="showUser" :index="selectIndex" @listenToChildEvent="getSelectUser"/>
    <transition name="confirm-fade">
      <div v-if="isShowConfirm" class="my-confirm" @click.stop="clickFun('clickCancel')">
        <div class="confirm-content-wrap" @click.stop>
          <h3 class="my-confirm-title">{{ titleText }}</h3>
          <p class="my-confirm-content"><el-checkbox v-model="article.wechatNotify">{{ content }}</el-checkbox></p>
          <div class="my-operation">
            <div v-if="type==='confirm'" style="cursor:pointer;" class="my-cancel-btn" @click="clickFun('clickCancel')">
              <p class="my-btn-text my-border-right">{{ cancelText }}</p>
            </div>
            <div class="confirm-btn" style="cursor:pointer;" @click="clickFun('clickConfirm')">
              <p class="my-btn-text">{{ confirmText }}</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>

import VueUeditorWrap from 'vue-ueditor-wrap'
import Tinymce from '@/components/Tinymce'
import Upload from '@/components/Upload/singleImage3'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件
import { saveArticle, fetchArticle } from '@/api/article'
import Warning from './Warning'
import { CommentDropdown, PlatformDropdown, SourceUrlDropdown } from './Dropdown'
import { fetchTeacherList, fetchGroupList, fetchModuleList } from '@/api/user'
import showUser from '@/views/article/showUser'

export default {
  name: 'ArticleDetail',
  components: { showUser, VueUeditorWrap, Tinymce, MDinput, Upload, Sticky, Warning, CommentDropdown, PlatformDropdown, SourceUrlDropdown },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      props: {
        label: 'moduleName',
        value: 'id',
        children: 'moduleList'
      },
      selectedOptions2: undefined,
      moduleList: undefined,
      defaultConfig: {
        UEDITOR_HOME_URL: '../../static/ueditor/',
        enableAutoSave: false
      },
      selectTeacher: false,
      selectStudent: false,
      loading: false,
      hackReset: false,
      disabled: false,
      dialogFormVisible: false,
      userList: [],
      articleId: this.$route.params.id,
      selectIndex: undefined,
      article: {
        articleId: undefined,
        fid: this.$store.state.user.fid,
        title: undefined,
        upload: 0,
        type: '',
        content: '',
        group: undefined,
        attachmentList: [],
        receiverList: [],
        status: 0,
        moduleId: undefined,
        commentDisabled: true,
        wechatNotify: true,
        publishUser: undefined
      },
      articleModuleList: [],
      receiverList: [],
      listQuery: {
        fid: this.$store.state.user.fid,
        importance: undefined,
        name: undefined,
        type: undefined,
        sort: '+id'
      },
      input: '',
      users: undefined,
      groups: undefined,
      value7: '',
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 4, max: 50, message: '长度必须在4到50个字符之间', trigger: 'blur' }
        ]
      },
      isShowConfirm: false, // 用于控制整个窗口的显示/隐藏
      titleText: '提示', // 提示框标题
      content: '通过微信向用户发布通知!', // 提示框的内容
      cancelText: '取消', // 取消按钮的文字
      confirmText: '确认', // 确认按钮的文字
      type: 'confirm', // 表明弹框的类型：confirm - 确认弹窗（有取消按钮）；alert - 通知弹框（没有取消按钮）
      outerData: null // 用于记录外部传进来的数据，也可以给外部监听userBehavior，事件的函数提供判断到底是哪个事件触发的
    }
  },
  created() {
    this.getList()
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    show(content, config) {
      this.content = content || 'Say Something ...'
      if (Object.prototype.toString.call(config) === '[object Object]') {
        // 确保用户传递的是一个对象
        this.titleText = config.titleText || '提示'
        this.cancelText = config.cancelText || '取消'
        this.confirmText = config.confirmText || '确认'
        this.type = config.type || 'confirm'
        this.outerData = config.data || null
      }

      this.isShowConfirm = true
    },
    hidden() {
      this.isShowConfirm = false
      this.titleText = '操作提示'
      this.cancelText = '取消'
      this.confirmText = '确认'
      this.type = 'confirm'
      this.outerData = null
    },
    clickFun(type) {
    //  this.$emit('userBehavior', type, this.outerData)
      this.hidden()
      if (type === 'clickConfirm') {
        this.saveUEContent(1)
      }
    },
    publish() {
      if (this.article.attachmentList.length > 0) {
        this.$refs['article'].validate((valid) => {
          if (valid) {
            this.isShowConfirm = true
          }
        })
      } else {
        this.saveUEContent(1)
      }
    },
    handleChange(moduleList) {
      debugger
      if (moduleList.length > 0) {
        this.article.moduleId = moduleList[moduleList.length - 1]
      } else {
        this.article.moduleId = undefined
      }
    },
    getList() {
      fetchModuleList(this.listQuery).then(response => {
        this.moduleList = response.data.result
        for (var index in this.moduleList) {
          var list = this.moduleList[index].moduleList
          if (list.length === 0) {
            this.moduleList[index].moduleList = null
          } else {
            for (var index2 in list) {
              if (list[index2].moduleList.length === 0) {
                list[index2].moduleList = null
              }
            }
          }
        }
        this.fetchArticle()
      })
    },
    handleDeleteUser(index) {
      this.article.attachmentList.splice(index, 1)
    },
    fetchArticle() {
      if (this.articleId) {
        fetchArticle(this.articleId).then(response => {
          if (response.data.code === 200) {
            this.article = response.data.result
            if (this.moduleList != null) {
              for (var index in this.moduleList) {
                var parentModuleId = this.moduleList[index].id
                if (parentModuleId === this.article.moduleId) {
                  this.articleModuleList = [parentModuleId]
                } else {
                  var childModuleList = this.moduleList[index].moduleList
                  for (var index2 in childModuleList) {
                    if (childModuleList[index2].id === this.article.moduleId) {
                      this.articleModuleList = [parentModuleId, childModuleList[index2].id]
                    }
                  }
                }
              }
            }
            const route = Object.assign({}, this.tempRoute, { title: this.article.title })
            this.$store.dispatch('updateVisitedView', route)
          }
        })
      }
    },
    getSelectUser: function(data) {
      var tempList = []
      var userList = data.get('teacher')
      var userReceiver = {}
      for (var index in userList) {
        userReceiver = {}
        userReceiver.receiveUserId = userList[index].uid
        userReceiver.realname = userList[index].realname
        userReceiver.roles = [1]
        tempList.push(userReceiver)
      }
      userList = data.get('student')
      for (index in userList) {
        userReceiver = {}
        userReceiver.receiveUserId = userList[index].uid
        userReceiver.realname = userList[index].realname
        userReceiver.roles = [2]
        tempList.push(userReceiver)
      }
      var groupList = data.get('group')
      for (var i in groupList) {
        var groupReceiver = {}
        groupReceiver.receiveUserId = groupList[i].groupId
        groupReceiver.realname = groupList[i].name
        groupReceiver.roles = [3]
        tempList.push(groupReceiver)
      }
      for (const v of tempList) {
        var flag = true
        for (const userData of this.article.attachmentList) {
          if (v.receiveUserId === userData.receiveUserId && v.roles[0] === userData.roles[0]) {
            flag = false
            break
          }
        }
        if (flag) {
          this.article.attachmentList.push(v)
        }
      }
    },
    showSelectUser() {
      this.dialogFormVisible = true
    },
    selectUser(index) {
      this.selectIndex = index
      this.hackReset = false
      if (this.$refs.showUser) {
        this.$refs.showUser.handleModifyStatus(index)
      }
      this.$nextTick(() => {
        this.hackReset = true
      })
    },
    getReceivers(name) {
      if (name !== '') {
        this.listQuery.name = name
        fetchTeacherList(this.listQuery).then(response => {
          var data = response.data
          if (data.code === 200 && data.result.total > 0) {
            this.users = [{
              label: '用户',
              options: data.result.list
            }]
          } else {
            this.users = []
          }
        })
        fetchGroupList(this.listQuery).then(response => {
          var data = response.data
          if (data.code === 200 && data.result.total > 0) {
            this.groups = [{
              label: '组名',
              options: response.data.result.list
            }]
          } else {
            this.groups = []
          }
        })
      } else {
        this.users = []
        this.groups = []
      }
    },
    ready(editorInstance) {
      console.log(`编辑器实例${editorInstance.key}: `, editorInstance)
      // setInterval(this.getUEContent,10000)
    },

    getUEContent: function() {
      console.log(this.msg)
    },

    draft: function() {
      console.log(this.msg)
    },

    saveUEContent(status) {
      this.$refs['article'].validate((valid) => {
        if (valid) {
          this.loading = true
          this.article.status = status
          saveArticle(this.article).then(() => {
            this.loading = false
            this.$notify({
              title: '成功',
              message: '保存成功',
              type: 'success',
              duration: 2000
            })
            var path = this.$route
            var allOpenViews = this.$store.state.tagsView.visitedViews
            for (var index in allOpenViews) {
              if (allOpenViews[index].fullPath === path.fullPath) {
                this.$store.dispatch('delView', allOpenViews[index]).then(({ visitedViews }) => {
                  this.$router.push({ path: '/article/list' })
                })
              }
            }
          })
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "~@/styles/mixin.scss";
.createPost-container {
  position: relative;
  .createPost-main-container {
    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;
      .postInfo-container-item {
        float: left;
      }
    }
  }
  .word-counter {
    width: 40px;
    position: absolute;
    right: -10px;
    top: 0px;
  }
  .my-confirm {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    /* 这里防止当用户长按屏幕，出现的黑色背景色块，以及 iPhone 横平时字体的缩放问题 */
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  /* 进入和出去的动画 */
  .confirm-fade-enter-active {
    animation: opacity 0.3s;
  }
  .confirm-fade-enter-active .confirm-content-wrap {
    animation: scale 0.3s;
  }
  .confirm-fade-leave-active {
    animation: outOpacity 0.2s;
  }

  /* 包裹层容器样式 */
  .confirm-content-wrap {
    position: absolute;
    top: 28%;
    left: 0;
    right: 0;
    width: 280px;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 5px;
    z-index: 999;
    user-select: none;
  }

  /* 顶部标题部分 */
  .my-confirm-title {
    text-align: center;
    font-size: 20px;
    font-weight: 500;
    color: #333;
  }

  /* 中间内容部分 */
  .my-confirm-content {
    padding: 0 15px;
    margin-bottom: 20px;
    text-align: center;
    font-size: 16px;
    color: #666;
    line-height: 1.5;
  }

  /* 底部按钮样式 */
  .my-operation {
    display: flex;
    border-top: 1px solid #eee;
  }
  .my-operation .my-cancel-btn, .confirm-btn {
    flex: 1;
  }
  .my-operation .confirm-btn {
    color: #ffb000;
  }
  .my-operation .my-btn-text {
    text-align: center;
    font-size: 16px;
    margin: 14px 0;
    padding: 6px 0;
  }

  /* 其他修饰样式 */
  .my-border-right {
    border-right: 1px solid #eee;
  }

  /* 进来的动画 */
  @keyframes opacity {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  @keyframes scale {
    0% {
      transform: scale(0);
    }
    60% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  /* 出去的动画 */
  @keyframes outOpacity {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
}
</style>
