<template>
  <div class="video-player" ref="contaner"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
const contaner = ref(null);
const player: any = ref(null);

const createPlayer = (url) => {
  player.value = new window.Jessibuca({
    container: contaner.value, // 若为 string ，则底层调用的是 document.querySelector(container)
    videoBuffer: Number(0.2), // 缓存时长
    isResize: false, // 缓存时长 等比例缩放 false,铺满
    useWCS: false, // 是否开启Webcodecs硬解码
    useMSE: true, // 是否开启MediaSource硬解码
    // background: "bg.jpg", // 背景图片
    loadingText: "视频加载中...", // 加载过程中文案。
    // hasAudio:false, // 是否有音频，如果设置false，则不对音频数据解码，提升性能。 默认值：true
    debug: false, //  是否开启控制台调试打印
    supportDblclickFullscreen: true, //  是否支持屏幕的双击事件，触发全屏，取消全屏事件
    showBandwidth: true, // 显示网速
    operateBtns: {
      //  配置操作按钮
      fullscreen: true, // 全屏按钮
      // screenshot: this.showOperateBtns, // 是否显示截图按钮
      // screenshot: false, // 是否显示截图按钮

      play: true, // 是否显示播放暂停按钮
      audio: true, // 是否显示声音按钮
      record: true, // 是否显示声音按钮
    },
    // forceNoOffscreen: !this.useOffscreen, // 是否不使用离屏模式
    isNotMute: true, // 是否开启声音，默认是关闭声音播放的。
    timeout: 10, // 设置超时时长, 单位秒
    // ...this.options,

    // 失败重连次数
    heartTimeoutReplayTimes: 3,
  });
  player.value.play(url);
};
const props = defineProps({
  url: String,
});

onMounted(() => {
  watch(
    () => props.url,
    (n) => {
      if (player.value) {
        player.value.destroy();
      }
      createPlayer(n);
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
  width: 100%;
  height: 100%;
}
</style>