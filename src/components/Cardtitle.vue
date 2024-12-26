<template>
  <div>
    <div class="title">
      <div>{{ title }}</div>
      <div class="control"><slot></slot></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineProps } from "vue";
const { title } = defineProps({
  title: {
    type: String,
    default() {
      return "测试title";
    },
  },
});
</script>
<style lang="less" scoped>
.title {
  background: url("../assets/images/card-title.png") no-repeat 100% /100%;
  font-size: 18px;
  font-weight: 400;
  color: #fff;
  font-style: italic;
  padding-left: 12px;
  display: flex;
  justify-content: space-between;
  background-clip: border-box;
  padding: 10px;
  box-sizing: border-box;
  align-items: center;
}
</style>