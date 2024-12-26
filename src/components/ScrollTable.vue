<template>
  <div
    class="scrollContainer"
    :key="currentTime"
    :style="{ height: `${height}px` }"
  >
    <div
      class="scrollHead"
      :style="{
        height: headerHeight + 'px',
      }"
    >
      <div v-for="l in columns" :key="l.key" :style="{ width: `${l.width}px` }">
        {{ l.title }}
      </div>
    </div>
    <ul
      class="scrollBody"
      ref="wrapperDom"
      :style="{ height: `${height - headerHeight}px` }"
    >
      <ul ref="childDom1" @mouseenter="handleEnter" @mouseleave="handleLeave">
        <li
          v-for="(l, i) in dataSource"
          :data-key="rowKey ? l[rowKey] : `list${i}`"
          :key="rowKey ? l[rowKey] : `list${i}`"
          :style="{ height: `${rowHeight}px`, display: flex }"
        >
          <div
            v-for="(p, c) in columns"
            :key="`p${c}`"
            :style="getStyle(p, l)"
            @click="
              (e) => {
                e.stopPropagation();
                onCellClick(l, p);
                onRowClick?.(l);
              }
            "
          >
            {{ p?.render?.(i, l, l[p.key]) || l[p.key] }}
          </div>
        </li>
      </ul>
      <ul ref="childDom2"></ul>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import {
  onMounted,
  watch,
  ref,
  onBeforeUnmount,
  computed,
  nextTick,
} from "vue";

interface ViewProps {
  height: number;
  dataSource: Record<string, any>[];
  columns: TableColumn[];
  headerHeight?: number;
  rowHeight?: number;
  onRowClick?: (l: Record<string, any>) => void;
  rowKey?: string;
  scroll?: boolean;
}

export interface TableColumn {
  key: string;
  title: string;
  width: number;
  render?: (index: number, data: Record<string, any>, text: any) => any;
  onClick?: (data: Record<string, any>) => void;
}

const props = defineProps<ViewProps>();
const { height, columns, rowHeight = 27.5, headerHeight = 36, rowKey } = props;

const wrapperDom = ref<any>();
const childDom1 = ref<any>();
const childDom2 = ref<any>();
const currentTime = ref(new Date().getTime());
let count = 0;
let reqAnimation: number;

onMounted(() => {
  nextTick(() => {
    reqAnimation = window.requestAnimationFrame(taskStart);
  });
});
onBeforeUnmount(() => {
  handleEnter();
});
const dataSource = computed(() => {
  console.log("dataSource", dataSource);
  return props.dataSource;
});
watch(
  () => props.dataSource,
  () => {
    currentTime.value = new Date().getTime();
  }
);

const getStyle = (p, l) => {
  let pStyle = { width: `${p.width}px`, flex: 1 };
  if (l.lineColor) {
    pStyle["color"] = l.lineColor;
  }
  return pStyle;
};

const taskStart = () => {
  if (
    childDom1.value?.clientHeight >= wrapperDom.value?.clientHeight &&
    childDom2.value?.clientHeight < 10
  ) {
    childDom2.value.innerHTML = childDom1.value.innerHTML;
  }
  if (wrapperDom.value?.scrollTop >= childDom1.value?.scrollHeight) {
    wrapperDom.value.scrollTop = 0;
    count = 0;
  } else {
    count += 1;
    wrapperDom.value.scrollTop = count;
  }
  if (props.scroll) {
    reqAnimation = window.requestAnimationFrame(taskStart);
  }
};

const handleEnter = () => {
  window.cancelAnimationFrame(reqAnimation);
};
const handleLeave = () => {
  reqAnimation = window.requestAnimationFrame(taskStart);
};
const onCellClick = (l: Record<string, any>, p: TableColumn) => {
  p?.onClick?.(l);
};
</script>
<style lang="less" scoped>
.scrollContainer {
  width: 100%;

  div {
    text-align: center;
    display: inline-block;
    margin: 0;
    font-size: 14px;
    font-weight: normal;
    font-stretch: normal;
    letter-spacing: 0;
    opacity: 0.9;
  }

  .scrollHead {
    display: flex;
    align-items: center;
    background-color: rgba(9, 23, 62);

    div {
      font-size: 14px;
      font-stretch: normal;
      flex: 1;
      letter-spacing: 0;
      font-family: MicrosoftYaHei, sans-serif;
      font-weight: 400;
      color: #1dc1e6;
      opacity: 0.47;
    }
  }

  .scrollBody {
    padding: 0;
    overflow-y: scroll;
    width: 100%;
    scrollbar-width: none;
    -ms-overflow-style: none;

    ul {
      height: auto;
      padding: 0;
      margin: 0;
    }

    li {
      list-style: none;
      position: relative;
      cursor: pointer;
      display: flex;
      height: 36px;
      color: #fff;
      align-items: center;
    }

    li div {
      line-height: 36px;
      font-size: 12px;
      color: #fff;
      white-space: nowrap; /* 文本不换行 */
      overflow: hidden; /* 溢出部分隐藏 */
      text-overflow: ellipsis; /* 溢出部分用"..."代替 */
    }

    li:hover {
      background: rgba(43, 143, 171, 0.52);
      > div {
        color: #fff;
      }
    }

    &::-webkit-scrollbar {
      display: none;
    }

    li:nth-child(even) {
      background-color: rgba(43, 143, 171, 0.13);
    }

    li:nth-child(even):hover {
      background: rgba(43, 143, 171, 0.52);
      color: #fff;
    }
  }
}
</style>

