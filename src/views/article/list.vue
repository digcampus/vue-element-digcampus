<template>
  <div class="app-container">
    <div v-if="flag">
      <div id="dg" style="position: fixed;right: 20px;bottom: 50px;">
        <el-button style="margin-left: 10px;" type="mini" size="small" @click="showDetail">返回</el-button>
      </div>
      <div style="margin-top:-20px;">
        <span v-html="list[2].content"/>
      </div>
    </div>
    <div v-if="!flag">
      <el-table v-loading.body="listLoading" :show-overflow-tooltip="true" :data="list" border fit highlight-current-row style="width: 100%">
        <el-table-column align="center" label="ID" width="80">
          <template slot-scope="scope">
            <span>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column align="left" width="90px" label="发布者">
          <template slot-scope="scope">
            <span>{{ scope.row.realname }}</span>
          </template>
        </el-table-column>
        <el-table-column width="180px" align="center" label="时间">
          <template slot-scope="scope">
            <span>{{ scope.row.modifyTime }}</span>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" min-width="250px" align="left" label="标题">
          <template slot-scope="scope">
            <router-link :to="{path: '/notice/'+scope.row.articleId}" class="link-type" target="_blank">
              <span><svg-icon v-if="scope.row.upload===1" icon-class="uploadSvg" />{{ scope.row.title }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column align="center" width="80px" label="状态">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status==0" :type="scope.row.status | statusFilter">草稿</el-tag>
            <el-tag v-if="scope.row.status==1" :type="scope.row.status | statusFilter" class="link-type"><span @click="showUploadData(scope.row)">已发布</span></el-tag>
            <el-tag v-if="scope.row.status==2" :type="scope.row.status | statusFilter">关闭</el-tag>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" max-width="400px" align="left" label="附件">
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
              name="file"
            ><el-button size="mini" @click="handleUpdate(scope.row)"><i class="el-icon-upload el-icon--right"/>上传</el-button>

            </el-upload>
          </template>
        </el-table-column>
        <el-table-column :label="$t('action')" align="left" width="210">
          <template slot-scope="scope">
            <router-link :to="'/article/edit/'+scope.row.articleId">
              <el-button size="mini" type="primary" @click="handleUpdate(scope.row, scope.$index, true)">编辑</el-button>
            </router-link>
            <el-button size="mini" type="success" @click="updateSend(scope.row)">发布</el-button>
            <el-button size="mini" type="danger" @click="deleteArticle(scope.row)">删除</el-button>
            <!--<el-button style="margin:5px;float:right">
              <el-dropdown class="avatar-container right-menu-item" trigger="click">
                <i style="cursor:pointer" class="el-icon-caret-bottom"/>
                <el-dropdown-menu slot="dropdown">
                  <router-link :to="'/notice/edit/'+scope.row.articleId">
                    <el-dropdown-item>
                      {{ $t('edit') }}
                    </el-dropdown-item>
                  </router-link>
                  <el-dropdown-item divided>
                    <span style="display:block;" @click="showUploadData(scope.row)">查 看</span>
                  </el-dropdown-item>
                  <el-dropdown-item divided>
                    <span style="display:block;" @click="deleteArticle(scope.row)">{{ $t('delete') }}</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </el-button> -->
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          :current-page="listQuery.page"
          :page-sizes="[10,20,30, 50]"
          :page-size="listQuery.limit"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"/>
      </div>
    </div>
    <uploadUser ref="uploadUser"/>
  </div>
</template>

<script>
import { fetchList, deleteArticle, publishArticle } from '@/api/article'
import { downloadFile, deleteAttachment } from '@/api/user'
import uploadUser from '@/views/notice/uploadUser'

export default {
  name: 'ArticleList',
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger',
        1: 'success',
        0: 'info',
        2: 'danger'
      }
      return statusMap[status]
    }
  },
  components: {
    uploadUser
  },
  data() {
    return {
      importFileUrl: window.UEDITOR_HOME_URL + 'ueditor/importFile',
      uploadData: {
        noticeId: undefined
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
    deleteArticle(row) {
      deleteArticle(row.articleId).then(() => {
        fetchList(this.listQuery).then(response => {
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
    showUploadData(item) {
      // 支持上传查看上传信息，否则查看已经查看该消息的用户列表
      this.$refs.uploadUser.handleModifyStatus(item)
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
      this.selectRow = row
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.result.list
        this.total = response.data.result.total
        this.listLoading = false
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
    },
    updateSend(row) {
      row.status = 1
      publishArticle(row).then(() => {

      })
    }
  }
}
</script>

<style scoped>
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
