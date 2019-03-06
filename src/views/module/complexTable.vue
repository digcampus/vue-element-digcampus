<template>
  <div class="app-container">
    <div class="filter-container" style="margin-top:-10px;">
      <el-button v-if="$store.state.user.admin && type" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('table.add') }}</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      :show-overflow-tooltip="true"
      :row-key="getRowKeys"
      :height="tableHeight"
      border
      fit
      highlight-current-row
      style="width: 100%;min-height:300px;ellipsis;margin-top:-10px;"
      @selection-change="handleSelectionChange">
      <el-table-column
        :reserve-selection="true"
        type="selection"
        width="35"/>
      <el-table-column :label="$t('table.id')" align="center" width="50px">
        <template slot-scope="scope">
          <span>{{ scope.$index+1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模块名称" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.moduleName }}</span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="创建时间" width="180px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.status == 1 ? '可用' : '关闭' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="分类" align="center" min-width="120px">
        <template slot-scope="scope">
          <div v-for="(item) in scope.row.classifyList" :gutter="1" :key="item.classifyId" type="flex" class="row-bg" justify="left" style="margin-top:2px;">
            <div :span="12" style="float:left;margin:2px;">
              <span class="el-tag el-tag--info el-tag--small" style="float:left;">
                <span class="link-type" @click="handleEditClass(scope.row)">{{ item.classifyName }}</span>
              </span>
            </div>
        </div></template>
      </el-table-column>
      <el-table-column v-if="!classId" :label="$t('table.actions')" align="center" width="60">
        <template slot-scope="scope">
          <el-dropdown class="avatar-container right-menu-item" trigger="click">
            <el-button style="cursor:pointer" class="el-icon-caret-bottom"/>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="$store.state.user.admin">
                <span style="display:block;" @click="handleUpdate(scope.row, false)">{{ $t('edit') }}</span>
              </el-dropdown-item>
              <el-dropdown-item divided>
                <span style="display:block;" @click="handleDelete(scope.row,'deleted')">{{ $t('delete') }}</span>
              </el-dropdown-item>
              <el-dropdown-item divided>
                <router-link :to="{path: '/score/index'}">
                  <span style="display:block;">成绩</span>
                </router-link>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" append-to-body style="width: 800px;margin: 0 auto 50px;">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="80px" style="width: 90%; margin-left:10px;">
        <el-form-item label="模块名称" prop="moduleName">
          <el-input v-model="temp.moduleName" :maxlength="20"/>
        </el-form-item>
        <el-form-item label="分类" prop="address">
          <el-row v-for="(classify,index) in temp.classifyList" :gutter="10" :key="classify.classifyId" type="flex" class="row-bg" justify="left" style="margin-top:5px;">
            <el-col :span="12">
              <el-popover
                v-model="classify.visiblePopover"
                placement="top"
                width="300"
                trigger="click">
                <el-form :model="formLabelAlign" label-position="right" label-width="80px">
                  <el-form-item label="分类名称">
                    <el-input v-model="formLabelAlign.classifyName"/>
                  </el-form-item>
                  <el-form-item label="状态">
                    <el-select v-model="formLabelAlign.status" class="filter-item" style="width: 100%;">
                      <el-option v-for="item in statusOptions" :key="item.key" :label="item.name" :value="item.key"/>
                    </el-select>
                  </el-form-item>
                  <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="classify.visiblePopover = false">取消</el-button>
                    <el-button type="primary" size="mini" @click="updateParent(index)">确定</el-button>
                  </div>
                </el-form>
                <div slot="reference">
                  <span class="el-tag el-tag--info el-tag--small" style="float:left;">
                    <span class="link-type" @click="editParent(classify)">{{ classify.classifyName }}</span>
                    <i class="el-tag__close el-icon-close" @click="deleteParent(index)"/>
                  </span>
                </div>
              </el-popover>
            </el-col>
          </el-row>
          <el-popover
            v-model="formLabelAlign.visiblePopover"
            placement="top"
            width="300"
            trigger="click">
            <el-form ref="popoverForm" :rules="rules" :model="formLabelAlign" label-position="right" label-width="80px">
              <el-form-item label="分类名称" prop="classifyName">
                <el-input v-model="formLabelAlign.classifyName"/>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="formLabelAlign.status" class="filter-item" style="width: 100%;">
                  <el-option v-for="item in statusOptions" :key="item.key" :label="item.name" :value="item.key"/>
                </el-select>
              </el-form-item>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="formLabelAlign.visiblePopover = false">取消</el-button>
                <el-button type="primary" size="mini" @click="updateParent(-1)">确定</el-button>
              </div>
            </el-form>
            <el-button slot="reference" icon="el-icon-circle-plus-outline" size="mini" round @click="createParent()">添加</el-button>
          </el-popover>

        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="temp.status" class="filter-item" style="width: 100%;">
            <el-option v-for="item in statusOptions" :key="item.key" :label="item.name" :value="item.key"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{ $t('table.confirm') }}</el-button>
        <el-button v-else type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchPv } from '@/api/article'
import { fetchModuleList, fetchGradeList, createModule, deleteStudent } from '@/api/user'
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'

const calendarTypeOptions = [
  { key: 0, display_name: '关闭' },
  { key: 1, display_name: '可用' }
]

export default {
  name: 'ComplexTable',
  directives: {
    waves
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  props: {
    type: {
      type: Boolean,
      default: true
    },
    tableHeight: {
      type: String,
      default: window.innerHeight - 160 + 'px'
    },
    classId: {
      type: Number,
      default: undefined
    }
  },
  data() {
    return {
      disabled: true,
      tableKey: 0,
      list: null,
      total: null,
      fid: this.$store.state.user.fid,
      listLoading: true,
      listQuery: {
        page: 1,
        fid: this.$store.state.user.fid,
        limit: 20,
        status: 1,
        address: undefined,
        gradeId: undefined,
        classId: this.classId,
        importance: undefined,
        title: undefined,
        type: undefined,
        realname: undefined,
        area: undefined,
        sort: '+id'
      },
      formLabelAlign: {
        classifyName: undefined,
        tel: '',
        role: '',
        status: 1
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: [{ name: '可用', key: 1 }, { name: '关闭', key: 0 }],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        class: undefined,
        realname: undefined,
        sex: 1,
        parentStuList: [],
        classifyList: [],
        selectedOptions2: undefined,
        status: 1
      },
      dialogFormVisible: false,
      dialogStatus: 'create',
      textMap: {
        update: this.$t('edit'),
        create: this.$t('create')
      },
      gradeList: undefined,
      classList: undefined,
      props: {
        label: 'name',
        value: 'id',
        children: 'clazzList'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        moduleName: [{ required: true, message: '模块名称不能为空', trigger: 'blur' }],
        classifyName: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }]
      },
      downloadLoading: false,
      userList: []
    }
  },
  created() {
    this.getList()
    this.fetchGradeList()
  },
  methods: {
    getSelectUser() {
      return this.userList
    },
    updateClass() {
      for (const index in this.gradeList) {
        const grade = this.gradeList[index]
        if (grade.id === this.listQuery.gradeId) {
          this.classList = grade.clazzList
        }
      }
    },
    fetchGradeList() {
      fetchGradeList(this.listQuery).then(response => {
        this.gradeList = response.data.result.list
      })
    },
    handleSelectionChange(val) {
      this.userList = val
    },
    getRowKeys(row) {
      return row.uid
    },
    resetParent() {
      this.formLabelAlign = {
        name: undefined,
        role: undefined,
        tel: undefined,
        fid: this.fid,
        status: 1,
        visiblePopover: true
      }
    },
    createParent() {
      this.resetParent()
    },
    updateParent(index) {
      this.$refs['popoverForm'].validate((valid) => {
        if (valid) {
          if (index > -1) {
            this.temp.classifyList.splice(index, 1, this.formLabelAlign)
          } else {
            this.temp.classifyList.push(this.formLabelAlign)
          }
          this.formLabelAlign.visiblePopover = false
        }
      })
    },
    editParent(item) {
      this.formLabelAlign = JSON.parse(JSON.stringify(item))
      this.$nextTick(() => {
        this.$refs['popoverForm'].clearValidate()
      })
    },
    getList() {
      this.listLoading = true
      fetchModuleList(this.listQuery).then(response => {
        this.list = response.data.result
        this.listLoading = false
      })
    },
    deleteParent(index) {
      this.temp.classifyList.splice(index, 1)
    },
    handleChange(value) {
      if (this.temp.clazz == null) {
        this.temp.clazz = {}
      }
      if (value != null && value.length > 1) {
        this.temp.clazz.id = value[1]
      } else {
        this.temp.clazz.id = null
      }
    },
    handleFilter() {
      this.multipleSelection = []
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        graduationStatus: 1,
        enrollmentDate: '',
        sex: 0,
        name: undefined,
        status: 1,
        parentStuList: [],
        classifyList: [],
        address: undefined
      }
    },
    handleCreate() {
      this.resetTemp()
      this.disabled = false
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.enrollmentDate = parseTime(this.temp.enrollmentDate, '{y}-{m}-{d}')
          this.temp.moduleName = this.temp.moduleName
          this.temp.fid = this.fid
          createModule(this.temp).then(response => {
            if (response.data.code === 200) {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            } else {
              this.$notify({
                title: '失败',
                message: response.data.message,
                type: 'error',
                duration: 5000
              })
            }
          })
        }
      })
    },
    handleUpdate(row, disabled) {
      this.temp = Object.assign({}, row) // copy obj
      if (this.temp.enrollmentDate) {
        this.temp.enrollmentDate = new Date(this.temp.enrollmentDate)
      }
      // 避免数组浅拷贝，修改之前数据。
      this.temp.classifyList = JSON.parse(JSON.stringify(this.temp.classifyList))
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.enrollmentDate = parseTime(this.temp.enrollmentDate, '{y}-{m}-{d}')
          const tempData = Object.assign({}, this.temp)
          createModule(tempData).then(response => {
            if (response.data.code === 200) {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '添加成功',
                type: 'success',
                duration: 2000
              })
            } else {
              this.$notify({
                title: '失败',
                message: response.data.message,
                type: 'error',
                duration: 5000
              })
            }
          })
        }
      })
    },
    handleDelete(row) {
      deleteStudent(row).then(response => {
        fetchModuleList(this.listQuery).then(response => {
          this.list = response.data.result.list
          this.total = response.data.result.total
        })
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
