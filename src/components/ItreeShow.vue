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
    <div class="itreeShow" v-if="showpage">
      <template v-if="treeData.length">
        <div class="tree-box" v-for="(item, index) in treeData" :key="index">
          <div class="flex" :class="{
              'tree-child': (!item.children || item.children.length == 0) && (index+1 != treeData.length),
              'tree-child-title notree-child-title': index+1 != treeData.length && (!item.children || (item.children && item.children.length == 0))
            }">
            <span class="icon" :class="{
              'switch': item.children && item.children.length,
              'icon-open': !item.istreeshow,
              'icon-close': item.istreeshow
            }" @click="handleShrinkIcon(item)"></span>
            <span class="tree-font" :class="{
              'tree-activity': defaultSelectedKeys.includes(item[propData.treeKeyField])
            }" @click="handleSelect(item)">{{ item[propData.treeTileField] }}</span>
            <span class="tree-age" v-if="propData.showNum && item[propData.treeNumField]">({{ item[propData.treeNumField] }})</span>
          </div>
          <template v-if="item.istreeshow">
            <treeList
              :class="{'no-tree-ul': treeData[index+1]?.children && treeData[index+1]?.children.length == 0}"
              :item="item"
              :defaultSelectedKeys="defaultSelectedKeys"
            ></treeList>
          </template>
        </div>
      </template>
      <div class="tree-kong" v-else>
        <a-empty >
          <span slot="description">暂无数据</span>
        </a-empty>
      </div>
      <!-- <template v-if="treeShow">
        <a-tree
          :showLine="true"
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
      </template> -->
    </div>
  </div>
</template>

<script>
import treeList from '../commonComponents/treeList.vue';
import API from '../api/index'
export default {
  name: 'ItreeShow',
  components: {
    treeList
  },
  provide() {
    return {
      propData: this.propData,
      handleShrinkIcon: this.handleShrinkIcon,
      handleSelect: this.handleSelect
    }
  },
  data() {
    return {
      defaultSelectedKeys: [],
      showpage: false,
      treeData: [],
      moduleObject: {},
      cacheParams: {},
      dataFlag: true,
      propData: this.$root.propData.compositeAttr || {
        width: '300px',
        height: '100%',
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
    // 收缩按钮
    handleShrinkIcon(item) {
      item.istreeshow = !item.istreeshow;
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
    handleSelect(item) {
      let ary = [];
      ary.push(item[this.propData.treeKeyField])
      this.defaultSelectedKeys = ary
      this.sendMessage()
    },
    getMockData() {
      this.treeData = [
      {
        name: '发文',
        value: '2305262001457EcjMOO9fUw7XxwWltG',
        url: 'https://www.baidu.com/',
        children: [
            {
              name: '党组',
              value: '240507163105YVjAEL4n2kdN1dPJgFI',
              children: [
                {
                  name: '党组1',
                  value: '23232',
                  children: []
                }
              ]
            },
            {
              name: '专报',
              value: '220827105307oCGCSqvC7EuhC7dpJD2',
              children: [
                {
                  name: '专报1',
                  value: '3232',
                  children: []
                }
              ]
            },
          ],
        },
        {
          name: '收文',
          value: '0-1',
          children: [
            {
              name: '党组',
              value: '0-1-0',
              children: []
            },
            {
              name: '专报',
              value: '0-1-1',
              children: []
            }
          ],
        },
        {
          name: '收文',
          value: '0-2',
          children: [
            {
              name: '党组2',
              value: '0-2-0',
            },
            {
              name: '专报2',
              value: '0-2-1',
            }
          ],
        }
      ];
      this.treeData.length && this.handleTreeAdd(this.treeData);
      this.handleData()
      this.treeData.length && this.handleSetNum(this.treeData, {"2305262001457EcjMOO9fUw7XxwWltG": 2,"240507163105YVjAEL4n2kdN1dPJgFI": 1, "220827105307oCGCSqvC7EuhC7dpJD2": 3});
    },
    // 处理tree 添加数据
    handleTreeAdd(tree) {
      for(let i=0; i<tree.length; i++) {
        let item = tree[i];
        this.$set(item, 'istreeshow', true);
        if (item.children && item.children.length > 0) {
          this.handleTreeAdd(item.children)
        }
      }
    },
    handleData() {
      this.showpage = true;
      this.treeData.length && this.defaultChooseData();
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
          this.$set(item, this.propData.treeNumField, obj[item[this.propData.treeKeyField]])
          item.children && this.handleSetNum(item.children, obj)
        })
      }
    },
    requireData() {
      this.showpage = false;
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
          this.treeData.length && this.handleTreeAdd(this.treeData);
          this.handleData()
          // 树形数字
          this.propData.contentTreeDataSource && IDM.datasource.request(this.propData.contentTreeDataSource[0]?.id, {
            moduleObject: this.moduleObject,
            ...this.cacheParams,
            ...params
            }, (data) => {
            let result = data && JSON.parse(data);
            (this.treeData.length && result) && this.handleSetNum(this.treeData, result);
            this.showpage = false;
            this.showpage = true;
          })
      })
    },
    async initData() {
      if (this.moduleObject.env !== 'production') {
        this.getMockData()
        return
      }
      // let res = await API.ApiWhThreeData({fileType: "", year: ""})
      // if (res.code == '200') {
      //   this.treeData = res.data;
      //   this.handleTreeAdd(this.treeData);
      //   this.handleData()
      //   let result = await API.ApiWhThreeNumData({fileType: "", year: ""})
      //   let flag = result.data && JSON.parse(result.data);
      //   flag && this.handleSetNum(this.treeData, flag);
      //   this.showpage = false;
      //   this.showpage = true;
      //   console.log(this.treeData)
      // }
      this.requireData();
    },
    init() {
      this.handleStyle()
      this.initData()
    }
  }
}
</script>

<style lang="scss">
.itreeShow{
  user-select: none;
  .flex{
    display: flex;
    align-items: center;
  }
  .tree-font{
    display: inline-block;
    font-size: 16px;
    color: #333;
    margin-left: 5px;
    cursor: pointer;
    width: 90%;
    flex: 1;
    padding-top: 5px;
  }
  .tree-kong{
    height: 100%;
    display: flex;
    align-items: center;
  }
  .tree-age{
    color: #E02020;
    font-size: 16px;
    // width: 10%;
  }
  .tree-box:last-of-type{
    .tree-ul{
      background: unset;
    }
  }
  .tree-child{
    padding-left: 20px;
  }
  .tree-child::after{
    content: "";
    display: inline-block;
    width: 21px;
    height: 31px;
    background-image: url('../assets/metro.png');
    background-repeat: no-repeat;
    cursor: pointer;
    background-position: -84px -19px;
    position: absolute;
    left: 24px;
  }
  .tree-child-title{
    padding-left: 20px;
  }
  .tree-child-title::after{
    content: "";
    display: inline-block;
    width: 21px;
    height: 31px;
    background-image: url('../assets/metro.png');
    background-repeat: no-repeat;
    cursor: pointer;
    background-position: -84px -42px;
    position: absolute;
    left: 24px;
  }
  .notree-child-title::after{
    background-image: unset;
  }
  .tree-activity{
    // background-color: #e5e5e5;
    font-weight: bold;
  }
  .switch{
    width: 18px;
    height: 18px;
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }
  .icon{
    display: inline-block;
    vertical-align: middle;
    border: 0;
    cursor: pointer;
    outline: none;
  }
  .icon-open{
    background-image: url("../assets/jia.png");
  }
  .icon-close{
    background-image: url("../assets/jian.png");
  }
  .itreelist{
    .tree-ul{
      padding-left: 25px;
      background: url('../assets/line_conn.png') 0 0 repeat-y;
      position: relative;
    }
  }
  .no-tree-ul{
    .tree-ul{
      background: unset;
    }
  }
}
</style>