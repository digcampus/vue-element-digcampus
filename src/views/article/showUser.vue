<template>
  <el-dialog :visible.sync="dialogFormVisible" title="收件人" width="60%" height="2200">
    <el-tabs type="border-card" style="height: 610px;margin-top:-10px;margin-bottom:10px;" >
      <el-tab-pane v-if="index == 1" label="教师">
        <complexTeacherTable ref="complexTeacherTable" :table-height="520 + 'px'" :type="false" style="margin-top:-20px;"/>
      </el-tab-pane>
      <el-tab-pane v-if="index == 1" label="学生">
        <complexStudentTable ref="complexStudentTable" :table-height="470 + 'px'" :type="false" style="margin-top:-20px;"/>
      </el-tab-pane>
      <el-tab-pane v-if="index == 2" label="班级">
        <complexClassTable ref="complexClassTable" :table-height="450 + 'px'" :type="false" style="margin-top:-20px;"/>
      </el-tab-pane>
      <el-tab-pane v-if="index == 3" label="群组">
        <complexGroupTable ref="groupComplexTable" :table-height="430 + 'px'" :type="false" style="margin-top:-20px;"/>
      </el-tab-pane>
    </el-tabs>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
      <el-button type="primary" @click="addUser">{{ $t('table.add') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { fetchList } from '@/api/article'
import waves from '@/directive/waves' // 水波纹指令
import complexGroupTable from '@/views/group/index'
import complexStudentTable from '@/views/student/complexTable'
import complexTeacherTable from '@/views/teacher/complexTable'
import complexClassTable from '@/views/grade/complexClassTable'

export default {
  name: 'ShowUser',
  directives: {
    waves
  },
  components: {
    complexGroupTable,
    complexStudentTable,
    complexTeacherTable,
    complexClassTable
  },
  props: {
    index: {
      type: Number,
      default: 9
    }
  },
  data() {
    return {
      totalStuCount: 0,
      listLoading: true,
      classId: undefined,
      teacherName: undefined,
      showReviewer: false,
      dialogFormVisible: true,
      dialogStatus: '',
      dialogPvVisible: false,
      downloadLoading: false,
      userList: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    addUser() {
      var map = new Map()
      var complexTeacherTable = this.$refs.complexTeacherTable
      if (complexTeacherTable) {
        map.set('teacher', complexTeacherTable.getSelectUser())
      }
      var complexStudentTable = this.$refs.complexStudentTable
      if (complexStudentTable) {
        map.set('student', complexStudentTable.getSelectUser())
      }
      var complexGroupTable = this.$refs.complexGroupTable
      if (complexGroupTable) {
        map.set('group', complexGroupTable.getSelectGroup())
      }
      var complexClassTable = this.$refs.complexClassTable
      if (complexClassTable) {
        map.set('class', complexClassTable.getSelectClass())
      }
      //  map.set('class', this.$refs.gradeComplexTable.getSelectClass())
      //   this.userList = this.$refs.teacherComplexTable.getSelectUser().concat(this.$refs.studentComplexTable.getSelectUser())
      this.dialogFormVisible = false
      this.$emit('listenToChildEvent', map)
    },
    getTotalStu: function(data) {
      this.totalStuCount = data
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
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
    handleModifyStatus(index) {
      this.index = index
      this.dialogFormVisible = true
    }
  }
}
</script>
