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
    <div class="itreeShow">
      <template v-if="treeShow">
        <a-tree
          :showLine="false"
          :showIcon="false"
          :treeData="treeData"
          :replaceFields="{children: 'children', key: propData.treeKeyField, title: propData.treeTileField}"
          :defaultSelectedKeys="defaultSelectedKeys"
          :defaultExpandAll="true"
          :key="getKey"
          @select="handleSelect"
        >
        <span slot="switcherIcon" class="icon-plus"></span>
        <div slot="title" slot-scope="item">
          <span class="tree-title">{{ item[propData.treeTileField] || item.title }}</span>
          <span class="tree-age" v-if="propData.showNum && item[propData.treeNumField] || item.num">({{ item[propData.treeNumField] || item.num }})</span>
        </div>
        </a-tree>
      </template>
    </div>
  </div>
</template>

<script>
import API from '../api/index';
export default {
  name: 'ItreeShow',
  data() {
    return {
      defaultSelectedKeys: [],
      treeShow: false,
      treeData: [],
      moduleObject: {},
      cacheParams: {},
      dataFlag: true,
      propData: this.$root.propData.compositeAttr || {
        width: '300px',
        showNum: true,
        treeTileField: 'name',
        treeNumField: 'num',
        chooseStyle: 'first',
        treeKeyField: 'value'
      }
    }
  },
  mounted() {
    this.moduleObject = this.$root.moduleObject;
    this.init();
  },
  methods: {
    getKey(data) {
      return data[this.propData.treeKeyField].toString()
    },
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.init()
    },
    /**
     * @Desc 设置样式
     */
     handleStyle() {
      let styleObject = {};
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
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id + " .itreeShow", styleObject);
    },
    /**
     * 组件通信：接收消息的方法
     * @param {
     *  type:"发送消息的时候定义的类型，这里可以自己用来要具体做什么，统一规定的type：linkageResult（组件联动传结果值）、linkageDemand（组件联动传需求值）、linkageReload（联动组件重新加载）
     * 、linkageOpenDialog（打开弹窗）、linkageCloseDialog（关闭弹窗）、linkageShowModule（显示组件）、linkageHideModule（隐藏组件）、linkageResetDefaultValue（重置默认值）"
     *  message:{发送的时候传输的消息对象数据}
     *  messageKey:"消息数据的key值，代表数据类型是什么，常用于表单交互上，比如通过这个key判断是什么数据"
     *  isAcross:如果为true则代表发送来源是其他页面的组件，默认为false
     * } object 
     */
    receiveBroadcastMessage(object) {
      console.log("组件收到消息:ItreeShow", object);
      if (object.type && object.type == "linkageDemand") {
        let messageKey = object.messageKey,
          value = object.message.value;
        let obj = {}
        obj[messageKey] = value
        this.cacheParams = Object.assign({}, this.cacheParams, obj);
        this.requireData()
      }
    },
    /**
     * 组件通信：发送消息的方法
     * @param {
     *  type:"自己定义的，统一规定的type：linkageResult（组件联动传结果值）、linkageDemand（组件联动传需求值）、linkageReload（联动组件重新加载）
     * 、linkageOpenDialog（打开弹窗）、linkageCloseDialog（关闭弹窗）、linkageShowModule（显示组件）、linkageHideModule（隐藏组件）、linkageResetDefaultValue（重置默认值）",
     *  message:{实际的消息对象},
     *  rangeModule:"为空发送给全部，根据配置的属性中设定的值（值的内容是组件的packageid数组），不取子表的，比如直接 this.$root.propData.compositeAttr["attrKey"]（注意attrKey是属性中定义的bindKey）,这里的格式为：['1','2']"",
     *  className:"指定的组件类型，比如只给待办组件发送，然后再去过滤上面的值"
     *  globalSend:如果为true则全站发送消息，注意全站rangeModule是无效的，只有className才有效，默认为false
     * } object
     */
    sendBroadcastMessage(object) {
      window.IDM.broadcast && window.IDM.broadcast.send(object);
    },
    // 点击tree节点
    handleSelect(selectedKeys) {
      this.defaultSelectedKeys = selectedKeys;
      this.sendMessage()
    },
    getMockData() {
      this.treeData = [
      {
        title: '发文',
        value: '2305262001457EcjMOO9fUw7XxwWltG',
        num: 1,
        url: 'https://www.baidu.com/',
        children: [
            {
              title: '党组',
              value: '240507163105YVjAEL4n2kdN1dPJgFI',
              num: 2,
            },
            {
              title: '专报',
              value: '220827105307oCGCSqvC7EuhC7dpJD2',
              num: 3,
            },
          ],
        },
        {
          title: '收文',
          value: '0-1',
          children: [
            {
              title: '党组',
              value: '0-1-0',
            },
            {
              title: '专报',
              value: '0-1-1',
            }
          ],
        },
        {
          title: '收文',
          value: '0-2',
          children: [
            {
              title: '党组',
              value: '0-2-0',
            },
            {
              title: '专报',
              value: '0-2-1',
            }
          ],
        }
      ];
      this.handleData()
    },
    handleData() {
      this.treeShow = true;
      this.defaultChooseData();
    },
    // 获取id 对应数据
    handleTreeGetChooseId(tree, targetAry) {
      for(let i=0; i<tree.length; i++) {
        let item = tree[i];
        if (targetAry.includes(item[this.propData.treeKeyField])) {
          return item
        } else {
          if (item.children) {
            let node = this.handleTreeGetChooseId(item.children, targetAry);
            if (node) {
              return node
            }
          }
        }
      }
    },
    // 选择node后发送消息
    sendMessage() {
      if (this.defaultSelectedKeys.length > 0) {
        let current = this.handleTreeGetChooseId(this.treeData, this.defaultSelectedKeys);
        if (this.propData.handleClickTreeNode && this.propData.handleClickTreeNode.length > 0) {
          let name = this.propData.handleClickTreeNode[0].name
          current = window[name] && window[name].call(this, {
            _this: this,
            params: current,
          });
        }
        if(this.propData.linkageDemandPageModule&&this.propData.linkageDemandPageModule.length>0){
          let moduleIdArray = [];
          this.propData.linkageDemandPageModule.forEach(item=>{moduleIdArray.push(item.moduleId)});
          this.sendBroadcastMessage({
            type:"linkageDemand",
            message:current,
            rangeModule:moduleIdArray,
          })
        }
        if(this.propData.linkageResultPageModule&&this.propData.linkageResultPageModule.length>0){
          let moduleIdArray = [];
          this.propData.linkageResultPageModule.forEach(item=>{moduleIdArray.push(item.moduleId)});
          this.sendBroadcastMessage({
            type:"linkageResult",
            message:current,
            rangeModule:moduleIdArray,
          })
        }
      }
    },
    // 初始化默认
    defaultChooseData() {
      if (this.propData.chooseStyle == 'first') {
        let ary = []
        ary.push(this.treeData[0][this.propData.treeKeyField])
        this.defaultSelectedKeys = ary
        this.sendMessage()
      } else if (this.propData.chooseStyle == 'key') {
        let ary = []
        ary.push(this.propData.defaultKey)
        this.defaultSelectedKeys = ary
        this.sendMessage()
      }
    },
    handleSetNum(tree, obj) {
      if (tree && tree.length > 0) {
        tree.forEach(item => {
          item[this.propData.treeNumField] = obj[item[this.propData.treeKeyField]]
          item.children && this.handleSetNum(item.children, obj)
        })
      }
    },
    requireData() {
      this.treeShow = false;
      let params = {}
      if (this.propData.handleInterfaceFlag && this.propData.handleInterfaceFlag.length > 0) {
        let name = this.propData.handleInterfaceFlag[0].name
        params = window[name] && window[name].call(this, {
          _this: this,
          params: this.cacheParams,
        });
      }
      if (!this.dataFlag) return
      // 树形结构
      this.propData.contentDataSource && IDM.datasource.request(this.propData.contentDataSource[0]?.id, {
        moduleObject: this.moduleObject,
        ...this.cacheParams,
        ...params
        }, (data) => {
          this.treeData = data;
          this.handleData()
      })
      // 树形数字
      this.propData.contentTreeDataSource && IDM.datasource.request(this.propData.contentTreeDataSource[0]?.id, {
        moduleObject: this.moduleObject,
        ...this.cacheParams,
        ...params
        }, (data) => {
        let result = data && JSON.parse(data);
        result && this.handleSetNum(this.treeData, result);
      })
      this.handleSetTreeNum()
    },
    initData() {
      if (this.moduleObject.env !== 'production') {
        this.getMockData()
        return
      }
      this.requireData();
    },
    init() {
      this.handleStyle()
      this.initData()
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .ant-tree-switcher.ant-tree-switcher_open {
  .icon-plus {
    width: 100%;
    height: 100%;
    background-size: 100% 100%;
    background-image: url("../assets/jian.png"); // 收起节点时的icon
  }
}
::v-deep .ant-tree-switcher.ant-tree-switcher_close {
  .icon-plus {
    width: 100%;
    height: 100%;
    background-size: 100% 100%;
    background-image: url("../assets/jia.png"); // 展开节点时的icon
  }
}
::v-deep .ant-tree.ant-tree-show-line li:not(:last-child)::before{
  border-left: 1px dashed #979797;
}
.tree-title{
  display: inline-block;
  width: 90%;
  color: #333;
  font-size: 16px;
}
.tree-age{
  color: #E02020;
  font-size: 16px;
}
::v-deep .ant-tree li .ant-tree-node-content-wrapper{
  width: 100%;
}
::v-deep .ant-tree.ant-tree-show-line li:not(:last-child) .ant-tree-treenode-switcher-close::after,
::v-deep .ant-tree.ant-tree-show-line li:not(:last-child) .ant-tree-treenode-switcher-open::after {
  // content: '';
  width: 8px;
  height: 1px;
  position: absolute;
  border-top: 1px solid #979797;
  left: -6px;
  top: 18px;
}
::v-deep .ant-tree li span.ant-tree-switcher.ant-tree-switcher-noop {
  // display: none !important;
}
::v-deep .ant-tree-child-tree{
  padding: 10px 0 0 40px;
  position: relative;
  li &::after{
    content: "";
    width: 1px;
    height: 100%;
    border-left: 1px dashed #979797;
    position: absolute;
    top: 0;
  }
}
</style>