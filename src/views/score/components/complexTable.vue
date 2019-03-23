<template>
  <div class="app-container">
    <div class="filter-container" style="margin-top:-10px;">
      <el-select v-model="listQuery.exam" placeholder="考试名称" value-key="id" clearable class="filter-item" style="width: 250px" @change="fetchSemesterGradeList">
        <el-option v-for="item in examList" :key="item.id" :label="item.name" :value="item" />
      </el-select>
      <el-select v-model="listQuery.grade" placeholder="年级" value-key="id" clearable class="filter-item" style="width: 250px" @change="getClass">
        <el-option v-for="item in semesterGradeList" :key="item.id" :label="item.name" :value="item" />
      </el-select>
      <el-select v-model="listQuery.class" placeholder="班级" value-key="id" clearable class="filter-item" style="width: 250px" @change="getImportFileUrl">
        <el-option v-for="item in classList" :key="item.id" :label="item.name" :value="item" />
      </el-select>
      <el-button v-waves :disabled="!listQuery.grade.id" class="filter-item" type="primary" icon="el-icon-search" @click="fetchScoreListByClassAndSemester">{{ $t('table.search') }}</el-button>
      <el-button v-waves :disabled="!listQuery.class.id" class="filter-item" type="primary" icon="el-icon-upload" @click="dialogUploadVisible = true">上传成绩</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="scoreList[1]"
      :default-sort ="{prop:'rank_total',order:'ascending'}"
      :header-cell-style="getRowClass"
      border
      highlight-current-row
      style="width: 100%;min-height:300px;">
      <el-table-column :label="$t('table.id')" align="center" min-width="50">
        <template slot-scope="scope">
          <span>{{ scope.$index+1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="学生姓名" min-width="90px" align="center">
        <template slot-scope="scope">
          <el-tooltip placement="left" effect="light">
            <span>{{ scope.row.realname }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column v-if="showClass" label="班级" min-width="130px" align="center">
        <template slot-scope="scope">
          <el-tooltip placement="left" effect="light">
            <span>{{ scope.row.class_name }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="总分" prop="total" align="center" min-width="50">
        <template slot-scope="scope">
          <span>{{ scope.row.total }}</span>
        </template>
      </el-table-column>
      <el-table-column :formatter="formatAge" prop="avg" label="平均分" align="center" min-width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.total? scope.row.avg: null }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column :formatter="formatAge" prop="avg" label="等级" align="center" min-width="65">
        <template slot-scope="scope">
          <span v-if="scope.row.avg>=90">A</span>
          <span v-else-if="scope.row.avg<90 && scope.row.avg>=80">B</span>
          <span v-else-if="scope.row.avg<80 && scope.row.avg>=60">C</span>
          <span v-else>D</span>
        </template>
      </el-table-column> -->
      <el-table-column label="班级排名" align="center" prop="rank_total" min-width="105" sortable>
        <template slot-scope="scope">
          <span>{{ scope.row.rank_total }}</span>
        </template>
      </el-table-column>
      <el-table-column label="年级排名" align="center" prop="sum_rank_total" min-width="105" sortable>
        <template slot-scope="scope">
          <span>{{ scope.row.sum_rank_total }}</span>
        </template>
      </el-table-column>
      <el-table-column v-for="(message, index) in scoreList[0]" :prop="message" :key="index" :label="message" align="center" width="100">
        <el-table-column :prop="message" :formatter="formatScore" label="分数" align="center" min-width="50"/>
        <el-table-column :prop="'rank_' + message" :formatter="formatScoreRank" label="班级排名" align="center" min-width="105" sortable/>
        <el-table-column :prop="'sum_rank_' + message" :formatter="formatScoreRank" label="年级排名" align="center" min-width="105" sortable/>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" min-width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="$store.state.user.admin" type="primary" size="mini" @click="handleUpdate(scope.row, scope.$index, false)">{{ $t('table.edit') }}</el-button>
          <el-button size="mini" type="success" @click="handleUpdate(scope.row, scope.$index, true)">查看</el-button>
          <el-button v-if="$store.state.user.admin" size="mini" type="danger" @click="deleteGrade(scope.row)">{{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogUploadVisible" title="上传成绩" width="30%">
      <span class="el-tag el-tag--info el-tag--small" style="margin:5px;">
        {{ listQuery.exam.name }} - {{ listQuery.grade.name }} - {{ listQuery.class.name }}
      </span>
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
        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
        <div slot="tip" class="el-upload__tip">只能上传excel文件，且不超过5MB</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogUploadVisible = false">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>

    <edit-grade ref="editGrade" @listenToChildEvent="updateGradeRow"/>
  </div>
</template>

<script>
import { createArticle, updateArticle } from '@/api/article'
import { fetchSemesterGradeList, fetchGradeList, deleteGrade, fetchExamListByClassId, fetchScoreListByClassAndSemester } from '@/api/user'
import waves from '@/directive/waves' // 水波纹指令
import editClass from '@/views/grade/editClass'
import editGrade from '@/views/grade/editGrade'

export default {
  name: 'ComplexTable',
  directives: {
    waves
  },
  components: {
    editClass,
    editGrade
  },
  props: {
    teacherId: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      hackReset: true,
      tableKey: 0,
      list: null,
      total: null,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        fid: this.$store.state.user.fid,
        name: undefined,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id',
        gradeId: undefined,
        classId: undefined,
        examId: undefined,
        exam: {},
        grade: {},
        class: {}
      },
      importFileUrl: undefined,
      importanceOptions: [1, 2, 3],
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogUploadVisible: false,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: this.$t('edit'),
        create: this.$t('create')
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      classId: undefined,
      downloadLoading: false,
      examList: [],
      scoreList: [],
      semesterGradeList: [],
      classList: [],
      showClass: undefined,
      excelList1: [
        { name: 'food.jpeg',
          url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'
        }],
      excelList: [
      ]
    }
  },
  created() {
    this.fetchExamListByClassId()
    this.fetchGradeList()
  },
  methods: {
    submitUpload() {
      this.$refs.upload.submit()
    },
    handleSuccess(response, file, excelList) {
      if (response == null) {
        return
      }
    },
    getImportFileUrl() {
      this.importFileUrl = window.UEDITOR_HOME_URL + 'course/importExcel/' + this.listQuery.exam.id + '/' + this.listQuery.grade.id + '/' + this.listQuery.class.id
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
    fetchSemesterGradeList() {
      if (this.listQuery.exam) {
        fetchSemesterGradeList(this.listQuery.exam.id).then(response => {
          this.semesterGradeList = response.data.result
        })
      }
    },
    fetchGradeList() {
      fetchGradeList(this.listQuery).then(response => {
        this.gradeList = response.data.result.list
      })
    },
    getClass() {
      if (this.listQuery.grade) {
        for (const index in this.gradeList) {
          const grade = this.gradeList[index]
          if (grade.id === this.listQuery.grade.id) {
            this.classList = grade.clazzList
          }
        }
      }
    },
    getRowClass({ row, column, rowIndex, columnIndex }) {
      if (rowIndex === 0 && column.colSpan === 3) {
        if (columnIndex % 2 === 0) {
          return 'background:rgb(240, 249, 235);text-align:center;font-size:15px;font-weight:bold;'
        } else {
          return 'text-align:center;font-size:15px;font-weight:bold;'
        }
      } else {
        return ''
      }
    },
    formatScore(row, column, cellValue, index) {
      return row[column.property]
    },
    formatScoreRank(row, column, cellValue, index) {
      return row[column.property]
    },
    formatSum(row, column, cellValue, index) {
      var sum = 0
      for (var key in this.scoreList[0]) {
        var score = row[this.scoreList[0][key]]
        if (score) {
          sum += score
        }
      }
      if (sum) {
        return sum
      }
      return '缺考'
    },
    formatAge(row, column, cellValue, index) {
      var sum = 0
      for (var key in this.scoreList[0]) {
        var score = row[this.scoreList[0][key]]
        if (score) {
          sum += score
        }
      }
      return (sum / this.scoreList[0].length).toFixed(2)
    },
    fetchExamListByClassId() {
      fetchExamListByClassId(1).then(response => {
        this.examList = response.data.result
      })
    },
    fetchScoreListByClassAndSemester() {
      this.showClass = !this.listQuery.classId
      this.listLoading = true
      fetchScoreListByClassAndSemester(this.listQuery.exam.id, this.listQuery.grade.id, this.listQuery.class.id).then(response => {
        this.scoreList = response.data.result
        this.listLoading = false
      })
    },
    updateGradeRow: function(rowData, index) {
      if (index > -1) {
        this.list.splice(index, 1, rowData)
      } else {
        this.list.unshift(rowData)
      }
    },
    getList() {
      this.listLoading = true
      fetchGradeList(this.listQuery).then(response => {
        this.list = response.data.result.list
        this.total = response.data.result.total
        this.listLoading = false
      })
    },
    handleFilter() {
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
    deleteGrade(row) {
      deleteGrade(row.id).then(response => {
        fetchGradeList(this.listQuery).then(response => {
          this.list = response.data.result.list
          this.total = response.data.result.total
        })
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createArticle(this.temp).then(response => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row, index, disabled) {
      this.$refs.editGrade.handleModifyStatus(row, index, disabled)
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    }
  }
}
</script>
