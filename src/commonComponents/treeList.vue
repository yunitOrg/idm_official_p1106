<template>
  <div class="itreelist">
    <div class="tree-ul">
      <div class="tree-box" v-for="(file, subindex) in item.children" :key="subindex">
        <div class="flex" :class="{
          'tree-child': (!file.children || file.children.length == 0) && (subindex+1 != item.children.length),
          'tree-child-title': subindex+1 == item.children.length && (!file.children || (file.children && file.children.length == 0))
          }">
          <span class="icon" :class="{
            'switch': file.children && file.children.length,
            'icon-open': !file.istreeshow,
            'icon-close': file.istreeshow
          }" @click="handleIconClick(file)"></span>
          <span class="tree-font" :class="{
            'tree-activity': defaultSelectedKeys.includes(file[propData.treeKeyField])
            }" @click="handleClick(file)">{{ file[propData.treeTileField] }}</span>
          <span class="tree-age" v-if="propData.showNum && file[propData.treeNumField]">({{ file[propData.treeNumField] }})</span>
        </div>
        <div v-if="file.children && file.istreeshow">
          <treeList :item="file" :defaultSelectedKeys="defaultSelectedKeys"></treeList>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default{
  name: 'treeList',
  inject: ['propData', 'handleShrinkIcon', 'handleSelect'],
  props: {
    item: {
      type: Array,
      require: true
    },
    defaultSelectedKeys: {
      type: Array,
    }
  },
  methods: {
    handleIconClick(item) {
      this.handleShrinkIcon(item)
    },
    handleClick(item) {
      this.handleSelect(item)
    }
  }
}
</script>
