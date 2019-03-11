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
