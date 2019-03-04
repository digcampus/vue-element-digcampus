<template>
  <div class="createPost-container">
    <el-form ref="article" :model="article" :rules="rules">
      <sticky :class-name="'sub-navbar draft'">
        <CommentDropdown v-model="article.commentDisabled" />
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="saveUEContent(1)">发布
        </el-button>
        <el-button v-loading="loading" type="warning" @click="saveUEContent(0)">保存</el-button>
      </sticky>
      <el-form-item label="标题" label-width="120px" prop="title">
        <el-input v-model="article.title" :rows="1" :minlength="4" :maxlength="50" type="text" placeholder="请输入标题(少于50字)" style="width:95%;"/>
      </el-form-item>
      <el-form-item label="收件人" label-width="120px" style="margin-bottom:12px;">
        <el-button type="success" size="mini" @click="showSelectUser">收件人</el-button>
      </el-form-item>
      <el-form-item label="用户上传附件:" label-width="120px" prop="upload" style="margin-top:-12px;">
        <el-radio-group v-model="article.upload">
          <el-radio :label="0">不支持上传</el-radio>
          <el-radio :label="1">支持上传</el-radio>
        </el-radio-group>
      </el-form-item>
      <div class="createPost-main-container">
        <el-form-item prop="content" style="margin-top:-10px;">
          <div style="margin-left:15px;margin-right:25px;line-height:0px;">
            <vue-ueditor-wrap ref="ueditor" :config="defaultConfig" v-model="article.content" @ready="ready"/>
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
        :data="article.receiverList"
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
import { fetchTeacherList, fetchGroupList } from '@/api/user'
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
        commentDisabled: true
      },
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
      }
    }
  },
  created() {
    this.fetchArticle()
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    handleDeleteUser(index) {
      this.article.receiverList.splice(index, 1)
    },
    fetchArticle() {
      if (this.articleId) {
        fetchArticle(this.articleId).then(response => {
          if (response.data.code === 200) {
            this.article = response.data.result
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
        userReceiver.uid = userList[index].uid
        userReceiver.realname = userList[index].realname
        userReceiver.roles = [1]
        tempList.push(userReceiver)
      }
      userList = data.get('student')
      for (index in userList) {
        userReceiver = {}
        userReceiver.uid = userList[index].uid
        userReceiver.realname = userList[index].realname
        userReceiver.roles = [2]
        tempList.push(userReceiver)
      }
      var groupList = data.get('group')
      for (var i in groupList) {
        var groupReceiver = {}
        groupReceiver.uid = groupList[i].groupId
        groupReceiver.realname = groupList[i].name
        groupReceiver.roles = [3]
        tempList.push(groupReceiver)
      }
      for (const v of tempList) {
        var flag = true
        for (const userData of this.article.receiverList) {
          if (v.uid === userData.uid && v.roles[0] === userData.roles[0]) {
            flag = false
            break
          }
        }
        if (flag) {
          this.article.receiverList.push(v)
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
}
</style>
