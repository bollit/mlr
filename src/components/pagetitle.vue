<template>
  <div class="title">{{ title }}</div>
</template>
<script lang="ts" setup>
import { defineProps } from "vue";
const { title } = defineProps({
  title: String,
});
</script>
<style lang="less" scoped>
.title {
  background: url("../assets/images/card-title2.png") no-repeat 100% /100%;
  background-clip: border-box;
  padding: 8px 0 8px 8px;
  // height: 40px;
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 300;
  color: #32afdb;
}
</style>