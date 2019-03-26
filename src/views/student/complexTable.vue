<template>
  <div class="app-container">
    <div class="filter-container" style="margin-top:-10px;">
      <el-input v-model="listQuery.name" placeholder="学生姓名" style="width: 100px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-input v-model="listQuery.address" placeholder="地址" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-select v-model="listQuery.sex" placeholder="性别" clearable class="filter-item" style="width: 75px">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
      </el-select>
      <el-select v-if="!classId" v-model="listQuery.gradeId" placeholder="年级" clearable class="filter-item" style="width: 130px" @change="updateClass">
        <el-option v-for="item in gradeList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-select v-if="!classId" v-model="listQuery.classId" placeholder="班级" clearable class="filter-item" style="width: 150px" @change="getImportFileUrl">
        <el-option v-for="item in classList" :key="item.id" :label="item.name" :value="item.id"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button v-if="$store.state.user.admin && type" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('table.add') }}</el-button>
      <el-button v-waves v-if="$store.state.user.admin && !classId" :disabled="!listQuery.classId" class="filter-item" type="primary" icon="el-icon-upload" @click="dialogUploadVisible = true">上传学生</el-button>
      <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">显示家长</el-checkbox>
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
      <el-table-column label="学生姓名" width="90px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.realname }}</span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="学籍号" width="180px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.stuNo }}</span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="身份证号" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.idCard }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" width="50px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.sex == 0 ? '男' : '女' }}</span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="籍贯" width="120px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.nativePlace }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="false" :show-overflow-tooltip="true" label="角色" width="60px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.role }}</span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="家庭地址" min-width="150px">
        <template slot-scope="scope">
          <span class="link-type" style="text-overflow:ellipsis;" @click="handleUpdate(scope.row, true)">{{ scope.row.address }}</span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="联系电话" width="120px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.tel }}</span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="年级" width="100px" align="center">
        <template slot-scope="scope">
          <span>
            {{ scope.row.clazz == null ? '' : (scope.row.clazz.grade == null ? '' : scope.row.clazz.grade.name) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column v-if="!classId" :show-overflow-tooltip="true" label="班级" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.clazz == null ? '' : scope.row.clazz.name }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="showReviewer" label="家长" align="center" min-width="120px">
        <template slot-scope="scope">
          <div v-for="(item) in scope.row.parentStuList" :gutter="1" :key="item.id" type="flex" class="row-bg" justify="left" style="margin-top:2px;">
            <div :span="12" style="float:left;margin:2px;">
              <div class="grid-content "/>
              <el-tooltip placement="left-start">
                <div slot="content">电话: {{ item.tel== null? '无' : item.tel }}</div>
                <span class="el-tag el-tag--info el-tag--small" style="float:left;">
                  <span class="link-type" @click="handleEditClass(scope.row)"><svg-icon v-if="item.openid" icon-class="weixin"/>{{ item.realname }} {{ item.role ? '(' + item.role + ')' : '' }} </span>
                </span>
              </el-tooltip>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="!classId" :label="$t('table.actions')" align="center" width="60">
        <template slot-scope="scope">
          <el-dropdown class="avatar-container right-menu-item" trigger="click">
            <el-button style="cursor:pointer" class="el-icon-caret-bottom"/>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <router-link :to="{path: '/score/index'}">
                  <span style="display:block;">成绩</span>
                </router-link>
              </el-dropdown-item>
              <el-dropdown-item v-if="$store.state.user.admin" divided>
                <span style="display:block;" @click="handleUpdate(scope.row, false)">{{ $t('edit') }}</span>
              </el-dropdown-item>
              <el-dropdown-item v-if="$store.state.user.admin" divided>
                <span style="display:block;" @click="handleDelete(scope.row,'deleted')">{{ $t('delete') }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container" style="margin-top:10px;">
      <el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" :total="total" :layout="limit?'total, sizes, prev, pager, next, jumper': 'total'" background @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" append-to-body width="40%">
      <el-form ref="dataForm" :rules="rules" :model="temp" :disabled="disabled" label-position="right" label-width="20%" style="width: 90%; margin-left:10px;">
        <el-form-item label="学生姓名" prop="realname">
          <el-input v-model="temp.realname" :maxlength="20"/>
        </el-form-item>
        <el-form-item label="学籍号" prop="stuNo">
          <el-input v-model="temp.stuNo"/>
        </el-form-item>
        <el-form-item label="身份证件号" prop="idCard">
          <el-input v-model="temp.idCard"/>
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="temp.sex" class="filter-item">
            <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
          </el-select>
        </el-form-item>
        <el-form-item label="籍贯" prop="stuNo">
          <el-input v-model="temp.nativePlace"/>
        </el-form-item>
        <el-form-item label="民族" prop="stuNo">
          <el-input v-model="temp.folk"/>
        </el-form-item>
        <el-form-item label="班级" prop="code">
          <el-cascader
            v-model="temp.selectedOptions2"
            :options="gradeList"
            :props="props"
            clearable
            expand-trigger="hover"
            style="width: 100%;"
            @change="handleChange"/>
        </el-form-item>
        <el-form-item label="家庭地址" prop="address">
          <el-input v-model="temp.address"/>
        </el-form-item>
        <el-form-item label="联系电话" prop="address">
          <el-input v-model="temp.tel"/>
        </el-form-item>
        <el-form-item label="入学时间">
          <el-date-picker v-model="temp.enrollmentDate" type="date" placeholder="入学时间" style="width: 100%;"/>
        </el-form-item>
        <el-form-item label="家长" prop="address">
          <el-row v-for="(item,index) in temp.parentStuList" :gutter="10" :key="item.id" type="flex" class="row-bg" justify="left" style="margin-top:5px;">
            <el-col :span="12">
              <el-popover
                :disabled="disabled || item.openid"
                v-model="item.visiblePopover"
                placement="top"
                width="300"
                trigger="click">
                <el-form :model="formLabelAlign" label-position="right" label-width="60px">
                  <el-form-item label="姓名">
                    <el-input v-model="formLabelAlign.realname"/>
                  </el-form-item>
                  <el-form-item label="角色">
                    <el-input v-model="formLabelAlign.role"/>
                  </el-form-item>
                  <el-form-item label="手机号">
                    <el-input v-model="formLabelAlign.tel"/>
                  </el-form-item>
                  <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="item.visiblePopover = false">取消</el-button>
                    <el-button type="primary" size="mini" @click="updateParent(index)">确定</el-button>
                  </div>
                </el-form>
                <div slot="reference">
                  <span class="el-tag el-tag--info el-tag--small" style="float:left;">
                    <span class="link-type" @click="editParent(item)"><svg-icon v-if="item.openid" icon-class="weixin"/>{{ item.role }} ({{ item.realname }}-{{ item.tel }})</span>
                    <i v-if="!disabled" class="el-tag__close el-icon-close" @click="deleteParent(index)"/>
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
            <el-form ref="popoverForm" :rules="rules" :model="formLabelAlign" label-position="right" label-width="60px">
              <el-form-item label="姓名" prop="realname">
                <el-input v-model="formLabelAlign.realname"/>
              </el-form-item>
              <el-form-item label="角色">
                <el-input v-model="formLabelAlign.role"/>
              </el-form-item>
              <el-form-item label="手机号">
                <el-input v-model="formLabelAlign.tel"/>
              </el-form-item>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="formLabelAlign.visiblePopover = false">取消</el-button>
                <el-button type="primary" size="mini" @click="updateParent(-1)">确定</el-button>
              </div>
            </el-form>
            <el-button slot="reference" icon="el-icon-circle-plus-outline" size="mini" round @click="createParent()">添加</el-button>
          </el-popover>

        </el-form-item>
        <el-form-item :label="$t('table.status')">
          <el-select v-model="temp.graduationStatus" value-key="id" class="filter-item" style="width: 100%;">
            <el-option v-for="item in statusOptions" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>

        <el-form-item label="说明">
          <el-input :autosize="{ minRows: 3, maxRows: 6}" v-model="temp.comment" type="textarea"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button v-if="dialogStatus=='create' && !disabled" type="primary" @click="createData">{{ $t('table.confirm') }}</el-button>
        <el-button v-else-if="!disabled" type="primary" @click="updateData">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogUploadVisible" title="上传学生信息" width="30%">
      <el-upload
        ref="upload"
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :file-list="excelList"
        :auto-upload="false"
        :limit="1"
        :on-exceed="handleExceed"
        :on-success="handleSuccess"
        :before-upload="beforeUpload"
        :before-remove="beforeRemove"
        :action="importFileUrl"
        accept=".xls,.xlsx"
        class="upload-demo">
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传文件</el-button>
        <div slot="tip" class="el-upload__tip">只能上传excel文件，且不超过5MB</div>
        <div slot="tip" class="el-upload__tip" style="color:red;">{{ errorUploadMsg }}</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogUploadVisible = false">上传</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchPv } from '@/api/article'
import { fetchStuList, fetchGradeList, updateStudent, createStudent, deleteStudent } from '@/api/user'
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'

const calendarTypeOptions = [
  { key: 0, display_name: '男' },
  { key: 1, display_name: '女' }
]

const areaTypeOptions = [
  { key: '1', display_name: '外县' },
  { key: '2', display_name: '外镇' },
  { key: '3', display_name: '凉森村' },
  { key: '4', display_name: '跃进村' }
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
    limit: {
      type: Number,
      default: 20

    },
    type: {
      type: Boolean,
      default: true
    },
    tableHeight: {
      type: String,
      default: window.innerHeight - 200 + 'px'
    },
    classId: {
      type: Number,
      default: undefined
    }
  },
  data() {
    return {
      dialogUploadVisible: false,
      disabled: true,
      tableKey: 0,
      list: null,
      total: null,
      fid: this.$store.state.user.fid,
      listLoading: true,
      listQuery: {
        page: 1,
        fid: this.$store.state.user.fid,
        limit: this.limit,
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
        name: '',
        tel: '',
        role: ''
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      areaTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: [{ name: '在读', id: 1 }, { name: '转学', id: 0 }],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        class: undefined,
        realname: undefined,
        sex: 0,
        parentStuList: [],
        selectedOptions2: undefined,
        status: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
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
        realname: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
        stuNo: [{ required: true, message: '学号不能为空', trigger: 'blur' }]
      },
      downloadLoading: false,
      userList: [],
      excelList: [
      ],
      importFileUrl: undefined,
      errorUploadMsg: undefined
    }
  },
  created() {
    this.getList()
    this.fetchGradeList()
  },
  methods: {
    submitUpload() {
      this.$refs.upload.submit()
    },
    handleSuccess(response, file, excelList) {
      if (response.code !== 200) {
        this.errorUploadMsg = response.message
        return
      } else {
        this.excelList = excelList
      }
    },
    getImportFileUrl() {
      this.importFileUrl = window.UEDITOR_HOME_URL + 'student/importExcel/' + this.listQuery.fid + '/' + this.listQuery.classId
    },
    beforeUpload(file) {
      const isExcel = (file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      const isLt2M = file.size / 1024 / 1024 < 5
      if (!isExcel) {
        this.$message.error('只能上传Excel文件!')
      }
      if (!isLt2M) {
        this.$message.error('Excel文件大小不能超过5MB!')
      }
      return isExcel && isLt2M
    },
    handleRemove(file, excelList) {
      console.log(file, excelList)
    },
    handlePreview(file) {
      console.log(file)
    },
    handleExceed(files, excelList) {
      this.$message.warning(`只能上传一个文件，请先删除之前文件!`)
    },
    beforeRemove(file, excelList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
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
            this.temp.parentStuList.splice(index, 1, this.formLabelAlign)
          } else {
            this.temp.parentStuList.push(this.formLabelAlign)
          }
          this.formLabelAlign.visiblePopover = false
        }
      })
    },
    editParent(item) {
      if (!item.openid) {
        this.formLabelAlign = JSON.parse(JSON.stringify(item))
        item.visiblePopover = !this.disabled
        this.$nextTick(() => {
          this.$refs['popoverForm'].clearValidate()
        })
      }
    },
    getList() {
      this.listLoading = true
      fetchStuList(this.listQuery).then(response => {
        this.list = response.data.result.list
        this.total = response.data.result.total
        this.listLoading = false
      })
    },
    deleteParent(index) {
      this.temp.parentStuList.splice(index, 1)
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
          if (this.temp.clazz == null) {
            this.temp.clazz = {}
          }
          this.temp.enrollmentDate = parseTime(this.temp.enrollmentDate, '{y}-{m}-{d}')
          this.temp.username = this.temp.name
          this.temp.fid = this.fid
          this.temp.graduationStatus = 1
          this.temp.address = this.temp.address
          this.temp.roles = [2]
          createStudent(this.temp).then(response => {
            if (response.data.code === 200) {
              fetchStuList(this.listQuery).then(response => {
                this.list = response.data.result.list
                this.total = response.data.result.total
              })
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
      this.disabled = disabled
      this.temp = Object.assign({}, row) // copy obj
      var clazz = ''
      var grade = ''
      if (this.temp.clazz != null) {
        clazz = this.temp.clazz.id
        if (this.temp.clazz != null) {
          grade = this.temp.clazz.grade.id
        }
      }
      this.temp.selectedOptions2 = [grade, clazz]
      if (this.temp.enrollmentDate) {
        this.temp.enrollmentDate = new Date(this.temp.enrollmentDate)
      }
      // 避免数组浅拷贝，修改之前数据。
      this.temp.parentStuList = JSON.parse(JSON.stringify(this.temp.parentStuList))
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
          updateStudent(tempData).then(response => {
            if (response.data.code === 200) {
              fetchStuList(this.listQuery).then(response => {
                this.list = response.data.result.list
                this.total = response.data.result.total
              })
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
        fetchStuList(this.listQuery).then(response => {
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
