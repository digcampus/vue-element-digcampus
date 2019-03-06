<template>
  <div>
    <el-row :gutter="50" class="panel-group">
      <el-col :lg="24" class="card-panel-col">
        <el-card class="box-card" style="background-color:#d9e8fb">
          <el-menu
            :default-active="activeIndex"
            active-text-color="#66b1ff"
            class="el-menu-demo card-panel-text"
            mode="horizontal"
            @select="handleSelect">
            <div v-for="(item) in moduleList" :key="item.id" style="display: inline-block;">
              <el-menu-item v-if="item.classifyList.length<2 && item.classifyList.length>0" :index="item.classifyList[0].classifyId+''" >
                {{ item.moduleName }}
              </el-menu-item>
              <el-submenu v-if="item.classifyList.length>1" :index="item.classifyList[0].classifyId+''">
                <template slot="title"> {{ item.moduleName }}</template>
                <el-menu-item v-for="(item1, index) in item.classifyList" v-if="index>0" :key="item1.classifyId" :index="item1.classifyId + ''">
                  {{ item1.classifyName }}
                </el-menu-item>
              </el-submenu>
            </div>
          </el-menu>
          <div class="line"/>
          <div v-loading="listLoading" class="card-panel" style="min-height: 650px;padding-top:20px;" @click="handleSetLineChartData('purchases')">
            <div v-for="(item) in articleList" :key="item.articleId" class="text item separatorLine" style="margin-left:20px;">
              <a href="www.baidu.com">{{ item.title }}</a>
              <span style="float:right">{{ item.createTime }}</span>
              <span style="color: #a7a7a7;float:right; margin-right:20px;">[ 其他 ]</span>
            </div>
            <div v-if="articleList.length>0" class="pagination-container" style="margin-top:15px;margin-left:20px;">
              <el-pagination :current-page="1" :page-size="1" :total="20" background layout="total, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
            </div>
          </div>
          <div class="line"/>
          <el-tabs type="border-card" style="margin-top:20px;">
            <el-tab-pane v-for="(item) in moduleList" :key="item.id" :label="item.moduleName">
              <el-checkbox v-if="item.classifyList.length>0" :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
              <el-select v-if="item.classifyList.length>0" v-model="item.value5" multiple placeholder="请选择分类" style="width:50%">
                <el-option
                  v-for="item in item.classifyList"
                  :key="item.classifyId"
                  :label="item.classifyName"
                  :value="item.classifyId"/>
              </el-select>
              123
              123
            </el-tab-pane>
            <el-tab-pane label="教务通知">
              <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
              <el-select v-model="value5" multiple placeholder="请选择" style="width:50%">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"/>
              </el-select>
              <div v-for="o in 20" :key="o" class="text item separatorLine">
                <a href="www.baidu.com">{{ '列表内容 ' + o }}</a>
                <span style="float:right">2018-11-22</span>
                <span style="color: #a7a7a7;float:right; margin-right:20px;">[ 其他 ]</span>
              </div>
              <div class="pagination-container" style="margin-top:10px;">
                <el-pagination :current-page="1" :page-sizes="[10,20,30, 50]" :page-size="1" :total="20" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
              </div>
            </el-tab-pane>
            <el-tab-pane is-dot label="办事指南（教师）">配置管理</el-tab-pane>
            <el-tab-pane label="文件下载（学生）">角色管理</el-tab-pane>
            <el-tab-pane label="定时任务补偿">定时任务补偿</el-tab-pane>
          </el-tabs>
          <el-tabs type="border-card" style="margin-top:20px;">
            <el-tab-pane label="教师通知">
              <div v-for="o in 20" :key="o" class="text item separatorLine">
                <a href="www.baidu.com">{{ '列表内容 ' + o }}</a>
                <span style="float:right">2018-11-22</span>
                <span v-if="o != 10 " style="color: #a7a7a7;float:right; margin-right:20px;">[ 张三 - 其他 ]</span>
                <span v-if="o === 10 " style="color: #a7a7a7;float:right; margin-right:20px;">[ 张三1234 - 其他 ]</span>
              </div>
              <div class="pagination-container" style="margin-top:10px;">
                <el-pagination :current-page="1" :page-sizes="[10,20,30, 50]" :page-size="1" :total="20" background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange" @current-change="handleCurrentChange"/>
              </div>
            </el-tab-pane>
          </el-tabs>
          <el-tabs type="border-card" style="margin-top:20px;">
            <el-tab-pane name="more" class="more-btn">
              <span slot="label">
                <el-badge is-dot class="item">教务通知</el-badge>
              </span>
              测试
            </el-tab-pane>
          </el-tabs>
          <el-menu
            :default-active="activeIndex"
            active-text-color="#66b1ff"
            class="el-menu-demo"
            mode="horizontal"
            style="margin-top:20px;"
            @select="handleSelect">
            <el-menu-item index="1">处理中心</el-menu-item>
            <el-submenu index="2">
              <template slot="title">我的工作台</template>
              <el-menu-item index="2-1">选项1</el-menu-item>
              <el-menu-item index="2-2">选项2</el-menu-item>
              <el-menu-item index="2-3">选项3</el-menu-item>
              <el-submenu index="2-4">
                <template slot="title">选项4</template>
                <el-menu-item index="2-4-1">选项1</el-menu-item>
                <el-menu-item index="2-4-2">选项2</el-menu-item>
                <el-menu-item index="2-4-3">选项3</el-menu-item>
              </el-submenu>
            </el-submenu>
            <el-menu-item index="3" disabled>消息中心</el-menu-item>
            <el-menu-item index="4"><a href="https://www.ele.me" target="_blank">订单管理</a></el-menu-item>
            <el-menu-item index="5">处理中心5</el-menu-item>
          </el-menu>
          <div class="line"/>
          <div class="card-panel" @click="handleSetLineChartData('purchases')">
            <div class="card-panel-icon-wrapper icon-money">
              <svg-icon icon-class="money" class-name="card-panel-icon" />
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">天气预报</div>
              <count-to :start-val="0" :end-val="9280" :duration="3200" class="card-panel-num"/>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="40" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('purchases')">
          <div class="card-panel-icon-wrapper icon-money">
            <svg-icon icon-class="money" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">天气预报</div>
            <count-to :start-val="0" :end-val="9280" :duration="3200" class="card-panel-num"/>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('shoppings')">
          <div class="card-panel-icon-wrapper icon-shoppingCard">
            <svg-icon icon-class="shoppingCard" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">新闻</div>
            <count-to :start-val="0" :end-val="13600" :duration="3600" class="card-panel-num"/>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <el-card class="box-card">
          <div slot="header" class="clearfix panel-group">
            <span>最新公告</span>
            <a href="#/example/list">
            <el-button style="float: right; padding: 3px 0" type="text">更多...</el-button></a>
          </div>
          <div v-for="o in 8" :key="o" class="text item">
            <a href="#/example/list">{{ '列表内容afassdfsaffsdf列表内容列表内容列表内容列表内容列表内容列表内容 ' + o }}</a>[17/08/29]
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <el-card class="box-card">
          <div slot="header" class="clearfix panel-group">
            <span>资源管理</span>
            <el-button style="float: right; padding: 3px 0" type="text">更多...</el-button>
          </div>
          <div v-for="o in 8" :key="o" class="text item">
            <a href="www.baidu.com">{{ '列表内容 ' + o }}</a>[17/08/29]
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import CountTo from 'vue-count-to'
import { fetchModuleList } from '@/api/user'
import { fetchList } from '@/api/article'

const cityOptions = ['上海', '北京', '广州', '深圳']

export default {
  components: {
    CountTo
  },
  data() {
    return {
      listQuery: {
        fid: this.$store.state.user.fid
      },
      listArticleQuery: {
        fid: this.$store.getters.user.fid,
        classifyId: undefined,
        page: 1,
        limit: 20
      },
      listLoading: true,
      value: undefined,
      activeIndex: '0',
      activeIndex2: '0',
      moduleList: undefined,
      checkAll: false,
      checkedCities: ['上海', '北京'],
      cities: cityOptions,
      isIndeterminate: true,
      options: [{
        value: '选项1',
        label: '黄金糕'
      }, {
        value: '选项2',
        label: '双皮奶'
      }, {
        value: '选项3',
        label: '蚵仔煎'
      }, {
        value: '选项4',
        label: '龙须面'
      }, {
        value: '选项5',
        label: '北京烤鸭'
      }],
      value5: [],
      value11: [],
      articleList: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getArticleList() {
      this.listLoading = true
      fetchList(this.listArticleQuery).then(response => {
        this.articleList = response.data.result.list
        this.total = response.data.result.total
        this.listLoading = false
      }).catch((error) => {
        alert(error)
      })
    },
    getList() {
      this.listLoading = true
      fetchModuleList(this.listQuery).then(response => {
        this.moduleList = response.data.result
        if (this.moduleList) {
          this.activeIndex = '4'
          this.listArticleQuery.classifyId = 4
          this.getArticleList()
        }
        this.listLoading = false
      })
    },
    handleCheckAllChange(val) {
      this.checkedCities = val ? cityOptions : []
      this.isIndeterminate = false
    },
    handleCheckedCitiesChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.cities.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.cities.length
    },
    handleSelect(key, keyPath) {
      this.listArticleQuery.classifyId = key
      this.getArticleList()
      console.log(key, keyPath)
    },
    handleSizeChange(val) {
      this.$emit('pagination', { page: this.currentPage, limit: val })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    },
    handleCurrentChange(val) {
      this.$emit('pagination', { page: val, limit: this.pageSize })
      if (this.autoScroll) {
        scrollTo(0, 800)
      }
    },
    handleSetLineChartData(type) {
      this.$emit('handleSetLineChartData', type)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.el-submenu__icon-arrow {
    position: static !important;
}
.text {
    font-size: 15px;
  }
a{color:#333;text-decoration:none;}
a:hover{ color:#C81F1A; text-decoration:none;}
  .item {
    margin-bottom: 10px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }
.card-header {
  font-family: STKaiti;
  font-size: 20px;
  padding: 5px 0px;
  color: #333;
}
.separatorLine {
    /* clear: both; */
    /* height: 1px; */
    padding-bottom: 2px;
    margin-left: 20px;
    margin-right: 20px;
    border-width: 1px;
    border-style: dashed;
    border-color: #34bfa3;
    border-top: 0;
    font-size: 14px;
    font-family: "microsoft yahei", arial, sans-serif;
    border-left: none;
    border-right: 0;
}
.panel-group {
  margin-top: 18px;
  .card-panel-col{
    margin-bottom: 32px;
  }
  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);
    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }
      .icon-people {
         background: #40c9c6;
      }
      .icon-message {
        background: #36a3f7;
      }
      .icon-money {
        background: #f4516c;
      }
      .icon-shoppingCard {
        background: #34bfa3
      }
    }
    .icon-people {
      color: #40c9c6;
    }
    .icon-message {
      color: #36a3f7;
    }
    .icon-money {
      color: #f4516c;
    }
    .icon-shoppingCard {
      color: #34bfa3
    }
    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }
    .card-panel-icon {
      float: left;
      font-size: 48px;
    }
    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;
      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }
      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}
</style>
