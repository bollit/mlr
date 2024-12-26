<template>
  <div class="video-player" ref="contaner">
    <!-- 当视频不可用时显示封面 -->
    <img v-if="!isVideoAvailable" src="" alt="No Video" class="video-cover" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";

// 视频播放器容器
const contaner = ref(null);
const player: any = ref(null);

// 是否显示封面图的状态
const isVideoAvailable = ref(true); // 默认视频可用

const createPlayer = (url: string) => {
  // 重置封面图
  isVideoAvailable.value = true;

  player.value = new window.Jessibuca({
    container: contaner.value,
    videoBuffer: Number(0.2),
    isResize: false,
    useWCS: false,
    useMSE: true,
    loadingText: "视频加载中...",
    debug: false,
    supportDblclickFullscreen: true,
    showBandwidth: true,
    operateBtns: {
      fullscreen: true,
      play: true,
      audio: true,
      record: true,
    },
    isNotMute: true,
    timeout: 10,
    heartTimeoutReplayTimes: 3,
  });

  player.value
    .play(url)
    .then(() => {
      // 视频成功加载，确保封面隐藏
      isVideoAvailable.value = true;
    })
    .catch(() => {
      // 视频加载失败，显示封面
      isVideoAvailable.value = false;
    });
};

const props = defineProps({
  url: String,
});

onMounted(() => {
  watch(
    () => props.url,
    (newUrl) => {
      if (player.value) {
        player.value.destroy(); // 销毁当前播放器
      }
      createPlayer(newUrl); // 重新创建播放器并加载视频
    },
    {
      deep: true,
      immediate: true,
    }
  );
});
</script>


<style lang="less" scoped>
.video-player {
  width: 400px;
  height: 280px;
  position: relative;
  background-color: black; /* 如果没有视频，也用黑色背景 */
}

/* 视频封面图样式 */
.video-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 使封面图填充容器 */
  background-color: rgba(0, 0, 0, 0.7); /* 给封面图加个背景色 */
}
</style>

