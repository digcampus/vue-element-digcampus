<template>
  <div class="app-container">
    <div class="filter-container">
      <div class="filter-container" style="margin-top:-10px;">
        <el-input v-model="listQuery.name" placeholder="发布人" style="width: 100px;" class="filter-item" @keyup.enter.native="handleFilter"/>
        <el-input v-model="listQuery.address" placeholder="标题内容" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
        <el-select v-model="listQuery.sex" placeholder="状态" clearable class="filter-item" style="width: 110px">
          <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
        </el-select>
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
        <el-button class="filter-item" type="info" plain>全部消息</el-button>
      </div>
      <span class="el-tag el-tag--info el-tag--small" style="margin-right:10px;float:left;">
        <span>已选: {{ userList.length }}项</span>
      </span>
    </div>
    <div v-if="flag">
      <div id="dg" style="position: fixed;right: 20px;bottom: 50px;">
        <el-button style="margin-left: 10px;" type="mini" size="small" @click="showDetail">返回</el-button>
      </div>
      <div style="margin-top:-20px;">
        <span v-html="list[2].content"/>
      </div>
    </div>
    <div v-if="!flag">
      <el-table
        v-loading="listLoading"
        :data="list"
        :show-overflow-tooltip="true"
        :row-key="getRowKeys"
        border
        fit
        highlight-current-row
        style="width: 100%;min-height:300px;ellipsis;"
        @selection-change="handleSelectionChange">
        <el-table-column
          :reserve-selection="true"
          type="selection"
          width="35"/>
        <el-table-column align="center" label="ID" width="80">
          <template slot-scope="scope">
            <span>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" min-width="200px" align="left" label="标题内容">
          <template slot-scope="scope">
            <router-link :to="{path: '/notice/'+scope.row.articleId}" class="link-type" target="_blank">
              <span class="span"><i v-if="scope.row.articleAttachment.unread==2" class="tip"/><svg-icon v-if="scope.row.upload===1" icon-class="uploadSvg" />{{ scope.row.title }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column width="160px" align="center" label="更新时间">
          <template slot-scope="scope">
            <span>{{ scope.row.modifyTime }}</span>
          </template>
        </el-table-column>
        <el-table-column width="160px" align="center" label="发布时间">
          <template slot-scope="scope">
            <span>{{ scope.row.modifyTime }}</span>
          </template>
        </el-table-column>
        <el-table-column align="left" width="100px" label="发布人">
          <template slot-scope="scope">
            <span>{{ scope.row.realname }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90px" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.articleAttachment.unread==1" :type="scope.row.articleAttachment.unread | statusFilter">已读</el-tag>
            <el-tag v-if="scope.row.articleAttachment.unread==0" :type="scope.row.articleAttachment.unread | statusFilter" class="link-type"><span @click="updateAttachment(scope.row)">未读</span></el-tag>
            <el-tag v-if="scope.row.articleAttachment.unread==2" :type="scope.row.articleAttachment.unread | statusFilter" class="link-type"><span @click="updateAttachment(scope.row)">更新</span></el-tag>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" width="250px" align="left" label="附件">
          <template slot-scope="scope">
            <span v-if="scope.row.articleAttachment && scope.row.articleAttachment.attachmentName" class="el-tag el-tag--info el-tag--small">
              <i class="el-tag__close el-icon-close" @click="deleteAttachment(scope.row)"/>
              <a class="link-type" @click="download(scope.row.articleAttachment.url, scope.row.articleAttachment.attachmentName)">{{ scope.row.articleAttachment.attachmentName }}</a>
            </span>
            <el-upload
              v-else-if="scope.row.upload===1"
              :action="importFileUrl"
              :on-remove="handleRemove"
              :data="uploadData"
              :on-preview="handlePreview"
              :on-exceed="handleExceed"
              :on-success="handleSuccess"
              :file-list="scope.row.attachmentList"
              :show-file-list="false"
              style="float:left;margin:5px;"
              name="file"
            ><el-button size="mini" @click="handleUpdate(scope.row)"><i class="el-icon-upload el-icon--right"/>上传</el-button>

            </el-upload>
          </template>
        </el-table-column>
        <el-table-column :label="$t('action')" align="center" width="100">
          <template slot-scope="scope"/>
        </el-table-column>
      </el-table>
      <div class="pagination-container" style="margin-top:10px;">
        <el-button :disabled = "userList.length <= 0" type="info" size="mini" style="float:left" plain>删除</el-button>
        <el-button :disabled = "userList.length <= 0" type="info" size="mini" style="float:left" plain>标记已读</el-button>
        <el-button type="info" size="mini" style="float:left" plain @click="updateMsgStatus()">全部已读</el-button>
        <el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" :total="total" style="float:right" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
      </div>
    </div>
    <uploadUser ref="uploadUser"/>
  </div>
</template>

<script>
import { deleteArticle } from '@/api/article'
import { downloadFile, deleteAttachment, fetchMsgList, updateAttachment } from '@/api/user'
import uploadUser from '@/views/notice/uploadUser'
import waves from '@/directive/waves' // 水波纹指令

const calendarTypeOptions = [
  { key: 1, display_name: '已读' },
  { key: 0, display_name: '未读/更新' }
]

export default {
  name: 'ArticleList',
  directives: {
    waves
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger',
        0: 'success',
        1: 'info'
      }
      return statusMap[status]
    }
  },
  components: {
    uploadUser
  },
  data() {
    return {
      userList: [],
      calendarTypeOptions,
      importFileUrl: window.UEDITOR_HOME_URL + 'ueditor/importFile',
      uploadData: {
        noticeId: undefined,
        unread: undefined
      },
      attachmentList: [
        { name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100' }],
      list: null,
      total: 0,
      limit: 1,
      flag: false,
      count: 123,
      rowIndex: undefined,
      showReviewer: false,
      dialogPvVisible: false,
      listLoading: true,
      listQuery: {
        fid: this.$store.getters.user.fid,
        receiveUserId: this.$store.getters.user.uid,
        page: 1,
        limit: 20
      },
      selectRow: undefined
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleSelectionChange(val) {
      this.userList = val
    },
    getRowKeys(row) {
      return row.uid
    },
    handleFilter() {
      this.multipleSelection = []
      this.listQuery.page = 1
      this.$store.state.user.msgcount = 11
      this.getList()
    },
    deleteArticle(row) {
      deleteArticle(row.articleId).then(() => {
        fetchMsgList(this.listQuery).then(response => {
          this.list = response.data.result.list
          this.total = response.data.result.total
          this.listLoading = false
        }).catch((error) => {
          alert(error)
        })
      })
    },
    download(url, name) {
      downloadFile(url, name)
    },
    deleteAttachment(row) {
      this.$confirm('您确定删除吗？').then(_ => {
        row.articleAttachment.url = undefined
        row.articleAttachment.attachmentName = undefined
        deleteAttachment(row.articleAttachment).then(() => {
        })
      }).catch(_ => {
      })
    },
    handleUpdate(row) {
      this.uploadData.noticeId = row.articleId
      this.uploadData.unread = row.articleAttachment.unread
      this.selectRow = row
    },
    getList() {
      this.listLoading = true
      fetchMsgList(this.listQuery).then(response => {
        this.list = response.data.result.list
        this.total = response.data.result.total
        this.listLoading = false
      }).catch((error) => {
        alert(error)
      })
    },
    updateAttachment(item) {
      this.listLoading = true
      item.articleAttachment.unread = 1
      updateAttachment(item.articleAttachment).then(response => {
        this.listLoading = false
        this.$store.state.user.msgcount = this.$store.state.user.msgcount - 1
      }).catch((error) => {
        alert(error)
      })
    },
    handleRemove(file, attachmentList) {
      alert(file, attachmentList)
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    showDetail() {
      this.flag = !this.flag
    },
    handlePreview(file) {
      this.$message.warning(`file url = ` + file.url)
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    handleSuccess(response, file, attachmentList) {
      if (response == null) {
        return
      }
      this.selectRow.attachmentList = []
      this.selectRow.articleAttachment = response
      this.showReviewer = true
    },
    handleExceed(files, attachmentList) {
      this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + attachmentList.length} 个文件`)
    }
  }
}
</script>

<style scoped>
.span {
	position:relative;
	padding:5px;
}
.tip {
	display:block;
	background:#f00;
	border-radius:50%;
	width:6px;
	height:6px;
	top:10px;
	left:-5px;
	position:absolute;
}
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}

.demo-block {
    border: 1px solid #ebebeb;
    border-radius: 3px;
    transition: .2s;
    margin:20px;
}

</style>
