<template>
  <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
  <div
    idm-ctrl="idm_module"
    :id="moduleObject.id"
    :idm-ctrl-id="moduleObject.id"
  >
    <div class="iofficialstatus">
      <div class="table-search pd20">
        <div class="flex wdb20">
          <span class="minw100">主办部门：</span>
          <a-select v-model="search.deptId" style="width: 150px">
            <a-select-option value="">全部</a-select-option>
            <a-select-option :value="item.value" v-for="(item, index) in selectData.zhubanpart" :key="index">
              {{ item.text }}
            </a-select-option>
          </a-select>
        </div>
        <div class="flex wdb20">
          <span class="minw100">文件类型：</span>
          <a-select v-model="search.fileType" style="width: 150px">
            <a-select-option :value="item.value" v-for="(item, index) in selectData.fileType" :key="index">
              {{ item.text }}
            </a-select-option>
          </a-select>
        </div>
        <div class="wdb20 flex">
          <span class="minw100">时间：</span>
          <a-config-provider :locale="locale">
            <a-range-picker
              ref="picker"
              :placeholder="['开始时间', '结束时间']"
              valueFormat="YYYY-MM-DD"
              v-model="search.time"
              @change="handleTimeChange"
            >
            </a-range-picker>
          </a-config-provider>
        </div>
        <a-button class="m10" @click="handleSearch('week')" :class="chooseBtn=='week'&&'btnactivity'">本周</a-button>
        <a-button class="m10" @click="handleSearch('month')" :class="chooseBtn=='month'&&'btnactivity'">本月</a-button>
        <a-button class="m10" @click="handleSearch('jid')" :class="chooseBtn=='jid'&&'btnactivity'">本季度</a-button>
        <a-button class="m10" @click="handleSearch('year')" :class="chooseBtn=='year'&&'btnactivity'">本年</a-button>
        <div class="flexright">
          <a-button type="primary" class="m10" @click="handleSearch('search')">检索</a-button>
          <a-button class="m10" @click="handleSearch('reset')">重置</a-button>
          <a-button class="m10" @click="handleSearch('import')">导出</a-button>
        </div>
      </div>
      <div class="table">
        <a-table
          class="m20"
          ref="superTable"
          :columns="columns"
          :loading="loading"
          :scroll="{ x: propData.tableMaxWidth, y: tableRealMaxHeight }"
          :data-source="tableData"
          :locale="{emptyText: '暂无数据'}"
          :rowKey="(record, index) => (index)"
          bordered
          :pagination="false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import API from '../api/index';
import locale from 'ant-design-vue/es/locale/zh_CN';
import { openWindow } from '../utils/index'
export default {
  name: 'IofficialStatus',
  data() {
    return {
      locale,
      chooseBtn: '',
      loading: false,
      columns: [],
      tableData: [],
      search: {
        time: [],
        dateRange: '',
        deptId: '',
        startTime: '', // 开始时间
        endTime: '', // 结束时间
        fileType: ''
      },
      selectData: {
        zhubanpart: [],
        fileType: []
      },
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {}
    }
  },
  mounted() {
    this.moduleObject = this.$root.moduleObject;
    this.requireMount(() => {
      this.initData();
    });
    this.init()
  },
  methods: {
    handleTimeChange(date) {
      this.search.startTime = date.length > 0 ? date[0] : ''
      this.search.endTime = date.length > 0 ? date[1] : ''
    },
    handleSearch(type) {
      switch (type) {
        case 'week':
          this.chooseBtn = type;
          this.search.dateRange = 5;
          break
        case 'month':
          this.chooseBtn = type;
          this.search.dateRange = 4;
          break
        case 'jid':
          this.chooseBtn = type;
          this.search.dateRange = 3;
          break
        case 'year':
          this.chooseBtn = type;
          this.search.dateRange = 1;
          break
        case 'reset':
          this.chooseBtn = '';
          this.search.dateRange = '';
          this.search.time = [];
          this.search.startTime = '';
          this.search.endTime = '';
          break
        case 'import':{
          let url = `/ctrl/GwWhStatistics/exportHandlingWhStatisticData?deptId=${this.search.deptId}
          &startTime=${this.search.startTime}&endTime=${this.search.endTime}&dateRange=${this.search.dateRange}&fileType=${this.search.fileType}`
          openWindow(url)
        }
          break
      }
      this.initData();
    },
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.init()
    },
    // 获取主办部门-下拉数据
    async requireMount(fn) {
      let res = await API.Apizhubanpart();
      if (res.code == '200') {
        this.selectData.zhubanpart = res.data;
        // this.search.deptId = res.data[0].value
      }
      let result = await API.ApiFileType({type: 3});
      if (result.code == '200') {
        this.selectData.fileType = result.data;
        this.search.fileType = result.data[0].value
        fn && fn()
      }
    },
    /**
     * @Desc 设置样式
     */
     handleStyle() {
      let styleObject = {},
        tableObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key]
          if (!element && element !== false && element != 0) {
            continue
          }
          switch (key) {
            case 'width':
              styleObject['width'] = element;
              break
            case 'height':
              styleObject['height'] = element;
              break
            case 'ulbox':
              IDM.style.setBoxStyle(styleObject, element)
              break
            case 'bgColor':
              styleObject['background-color'] = element && element.hex8;
              break
            case 'boxShadow':
              styleObject['box-shadow'] = element;
              break
            case 'boxborder':
              IDM.style.setBorderStyle(styleObject, element);
              break
            case 'tableBox':
              IDM.style.setBoxStyle(tableObject, element)
              break
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .iofficialstatus", styleObject);
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .iofficialstatus .table", tableObject);
    },
    // 合并单元格
    handleRowSpan(key) {
      const tableData = this.tableData;
      for (let i=0; i<tableData.length; i++) {
        const item = tableData[i];
        let count = 1;
        for(let j=i+1; j<tableData.length; j++) {
          if (item[key] == tableData[j][key]) {
            count++
            tableData[j][`${key}RowSpan`] = 0
            item[`${key}RowSpan`] = count
            if (j == tableData.length-1) {
              return
            }
          } else {
            i=j-1;
            count=1;
            tableData[j][`${key}RowSpan`] = 0
            break
          }
        }
      }
    },
    handleDomHeight({height}) {
      let span = document.createElement('span')
      let result = {}
      result.width = span.offsetWidth;
      result.height = span.offsetHeight;
      span.style.display = 'inline-block';
      span.style.visibility = 'hidden';
      span.style.height = height
      document.body.appendChild(span)
      result.width = span.offsetWidth
      result.height = span.offsetHeight;
      span.parentNode?.removeChild(span)
      return result
    },
    // 查看表格是否添加滚动条
    handleTableScrollHeight() {
      this.$nextTick(() => {
        let table = this.$refs.superTable.$el
        let tableContent = table.querySelector('.ant-table-body')
        let expectHeight = this.handleDomHeight({height: this.propData.tableMaxHeight}),
          realHeight = tableContent.offsetHeight;
        if (realHeight > expectHeight.height) {
          this.tableRealMaxHeight = this.propData.tableMaxHeight
        }
      })
    },
    async initData() {
      let obj = Object.assign({}, this.search);
      this.loading = true;
      let res = await API.Apibanlistatic(obj);
      if (res.code == '200') {
        this.loading = false;
        let { data, header } = res.data;
        header.forEach(k => {
          k.align = 'center';
          k.title = k.label;
          k.dataIndex = k.value;
          if (k.value == "DEPT_ID") {
            k.customRender = (value, row, index) => {
              const obj = {
                children: value,
                attrs: {
                  rowSpan: row.DEPT_IDRowSpan
                }
              }
              return obj
            }
          } else if (k.value == "INDEX") {
            k.customRender = (value, row, index) => {
              const obj = {
                children: value,
                attrs: {
                  rowSpan: row.INDEXRowSpan
                }
              }
              return obj
            }
          }
        })
        if (this.propData.handleTableColumn && this.propData.handleTableColumn.length > 0) {
          let name = this.propData.handleTableColumn[0].name
          header = window[name] && window[name].call(this, {
            _this: this,
            params: header,
          });
        }
        this.columns = header;
        this.tableData = data;
      }
      this.handleRowSpan('DEPT_ID')
      this.handleRowSpan('INDEX')
      this.handleTableScrollHeight()
    },
    async init() {
      this.handleStyle()
    }
  }
}
</script>

<style lang="scss" scoped>
.iofficialstatus{
  ::v-deep .ant-table-thead > tr >th {
    color: #333 !important;
    font-size: 16px !important;
    font-weight: bold !important;
    padding: 10px 10px !important;
    background-color: #F6FBFA !important;
  }
  ::v-deep .ant-table-tbody tr:nth-child(2n) {
    // background-color: #F6FBFA;
  }
  .flex{
    display: flex;
    align-items: center;
  }
  .btnactivity{
    background-color: #1890ff;
    color: #fff;
  }
  .minw100{
    min-width: 100px;
  }
  .minw50{
    min-width: 50px;
  }
  .flexright{
    display: flex;
    justify-content: center;
    flex: 1;
    text-align: right;
  }
  .pd20{
    padding-top: 20px;
  }
  .wdb20{
    width: 20%;
  }
  .m20{
    margin-top: 20px;;
  }
  .m10{
    margin-left: 10px;
  }
  .table-search{
    display: flex;
    align-items: center;
    color: #333;
    text-align: center;
  }
}
</style>


