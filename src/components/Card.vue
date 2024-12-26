<template>
  <div class="card">
    <CardTitle v-if="showtitle" v-bind="$attrs">
      <slot name="control"></slot>
    </CardTitle>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, defineProps } from "vue";
import CardTitle from "./Cardtitle.vue";

const { showtitle } = defineProps({
  showtitle: {
    type: Boolean,
    default() {
      return true;
    },
  },
});
</script>
<style lang="less" scoped>
.card {
  // border: 1px solid red;
}
</style>
