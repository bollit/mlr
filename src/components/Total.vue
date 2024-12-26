<template>
  <div class="total-box">
    <div class="total-item" v-for="(it, idx) in totals" :key="idx">
      <img :src="imgs[it.src]" alt="" />
      <p class="label">{{ it.label }}</p>
      <p class="val">{{ it.value }}个</p>
    </div>
  </div>
</template>
<script lang="ts" setup>
import dot1 from "/@/assets/images/dot1.png";
import dot2 from "/@/assets/images/dot2.png";
import dot3 from "/@/assets/images/dot3.png";
import dot4 from "/@/assets/images/dot4.png";
import dot5 from "/@/assets/images/dot5.png";
import dot6 from "/@/assets/images/dot6.png";
import dot7 from "/@/assets/images/dot7.png";
import dot8 from "/@/assets/images/dot8.png";
import { ref } from "vue";

const { totals } = defineProps({
  totals: Object,
});
const imgs = {
  dot1,
  dot2,
  dot3,
  dot4,
  dot5,
  dot6,
  dot7,
  dot8,
};
</script>
<style lang="less" scoped>
.total-box {
  display: flex;
  justify-content: space-around;
  .total-item {
    text-align: center;
    img {
      width: 100px;
      height: 120px;
    }
    .label {
      font-size: 10px;
      color: #fff;
    }
    .val {
      color: #32afdb;
    }
  }
}
</style>