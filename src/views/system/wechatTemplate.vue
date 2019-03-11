<template>
  <div class="app-container">
    <div class="filter-container" style="margin-top:-10px;">
      <el-button class="filter-item" icon="el-icon-refresh" style="float:right;margin-left:15px;" @click="fetchWechatTemplateList()">拉取模板</el-button>
    </div>

    <el-table
      :data="list"
      :show-overflow-tooltip="true"
      border
      fit
      highlight-current-row
      style="width: 100%;min-height:300px;ellipsis;margin-top:-10px;">
      <el-table-column :label="$t('table.id')" align="center" width="50px">
        <template slot-scope="scope">
          <span>{{ scope.$index+1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="模板ID" min-width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.templateId }}</span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="模板标题" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" label="模板格式" min-width="300px" align="center">
        <template slot-scope="scope">
          <span><pre>{{ $options.filters.msg(scope.row.content) }}</pre></span>
        </template>
      </el-table-column>
      <el-table-column v-if="false" :show-overflow-tooltip="true" label="模板所属应用ID" width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.appid }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handlePublish(scope.row)">使用</el-button>
          <el-button size="mini" type="success" >禁用</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogFormVisible" title="微信模板消息" append-to-body style="width: 2500px;margin: 0 auto 50px;height:2000px;">
      <span>详情地址: </span><el-input v-model="moduleTemplate.url" style="width: 500px;"/>
      <div v-for="(datas,index) in moduleTemplate.data" :key="index">
        <div v-for="(item,index2) in datas" :key="index2" style="display:inline-block;margin:5px;">
          <span>{{ item.label }} </span><el-input v-if="item.name" v-model="item.value" style="width: 200px;"/>
        </div>
        <br>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" @click="createMsg">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script>
import { fetchWechatTemplateList, fetchTemplateList } from '@/api/user'
import { publishWechatMsg, getTemplateWidget } from '@/api/article'
import waves from '@/directive/waves' // 水波纹指令

export default {
  name: 'ComplexTable',
  directives: {
    waves
  },
  filters: {
    msg: function(msg) {
      return msg.replace(/\\n/gm, '<br/>')
    }
  },
  data() {
    return {
      moduleTemplate: {},
      dialogFormVisible: false,
      list: null,
      total: null,
      listQuery: {
        fid: this.$store.state.user.fid
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    createMsg() {
      this.moduleTemplate.touser = ['oE7971YVuGnNbxnL3Fc-26Y5SdLA']
      publishWechatMsg(this.moduleTemplate).then(response => {
        if (response.data.code === 200) {
          this.dialogFormVisible = false
        }
      })
    },
    handlePublish(template) {
      getTemplateWidget(template.templateId, template.content).then(response => {
        this.dialogFormVisible = true
        this.moduleTemplate = response.data.result
      })
    },
    fetchWechatTemplateList() {
      fetchWechatTemplateList(this.$store.state.user.fid).then(response => {
        this.list = response.data.result
        this.total = response.data.result.total
      })
    },
    getList() {
      fetchTemplateList(this.listQuery).then(response => {
        this.list = response.data.result
        this.total = response.data.result.total
      })
    }
  }
}
</script>
