<template>
  <div class="app-container">
    <div class="filter-container">
      <el-checkbox v-model="checkedTeacher" class="filter-item">本班老师</el-checkbox>
      <el-checkbox v-model="checkedStudent" class="filter-item">本班学生</el-checkbox>
    </div>
    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      :height="tableHeight"
      :row-key="getRowKeys"
      border
      fit
      highlight-current-row
      style="width: 100%;min-height:300px;margin-top:-10px;"
      @selection-change="handleSelectionChange">
      <el-table-column
        :reserve-selection="true"
        type="selection"
        width="35"/>
      <el-table-column :label="$t('table.id')" align="center" width="65">
        <template slot-scope="scope">
          <span>{{ scope.$index+1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="班级名称" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="年级名称" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.grade.name }}</span>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" :total="total" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
    </div>
  </div>
</template>

<script>
import { fetchGradeList, deleteGrade } from '@/api/user'
import { getClassList } from '@/api/grade'
import waves from '@/directive/waves' // 水波纹指令
import editClass from '@/views/grade/editClass'
import editGrade from '@/views/grade/editGrade'
import { parseTime } from '@/utils'

export default {
  name: 'ComplexTable',
  directives: {
    waves
  },
  components: {
    editClass,
    editGrade
  },
  data() {
    return {
      checkedTeacher: true,
      checkedStudent: true,
      hackReset: true,
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        fid: this.$store.state.user.fid,
        name: undefined,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
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
      classList: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getSelectClass() {
      return this.classList
    },
    handleSelectionChange(val) {
      this.classList = val
    },
    getRowKeys(row) {
      return row.id
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
      getClassList(this.listQuery).then(response => {
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
    handleUpdate(row, index, disabled) {
      this.$refs.editGrade.handleModifyStatus(row, index, disabled)
    },
    handleEditClass(item) {
      if (this.$refs.showClass) {
        this.$refs.showClass.handleModifyStatus(item)
      }
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
