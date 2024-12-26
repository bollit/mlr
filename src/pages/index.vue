<template>
  <v-scale-screen
    width="1920"
    height="1080"
    autoScale
    :fullScreen="true"
    :wrapperStyle="{ background: '#fff' }"
  >
    <div class="screen-container">
      <div class="screen-header">
        <div class="title">AI智能视频分析平台</div>
        <div class="menu"><img :src="menu" alt="menu" /></div>
        <div class="time">{{ currentDate }}</div>
      </div>
      <div class="screen-content">
        <div class="screen-left">
          <Card title="摄像头管理">
            <div class="came">
              <div
                class="camera-box"
                v-for="(it, idx) in cameraList"
                :key="idx"
                :style="{ background: `url(${it.src}) no-repeat 100% /100%` }"
              >
                <p>
                  <span class="value">{{ it.value }}</span
                  ><span class="dot">个</span>
                </p>
                <p class="desc">{{ it.label }}</p>
              </div>
            </div>
          </Card>
          <Card title="本月预警事件前十统计">
            <div class="chart">
              <Chart :option="option" />
            </div>
          </Card>
          <Card title="告警列表"
            ><ScrollTable
              :dataSource="warnSource"
              :columns="column"
              :height="370"
              :headerHeight="40"
              :rowHeight="40"
              :scroll="true"
            />
          </Card>
        </div>
        <div class="screen-middle">
          <Card title="系统管理">
            <Total :totals="totals" />
          </Card>
          <Card title="本月告警情况分析统计图 ">
            <div style="width: 100%; display: flex">
              <div class="left" style="width: 300px">
                <Chart :option="warningOptions" />
              </div>
              <div class="right" style="width: 400px">
                <Chart :option="Mapoption" />
              </div>
            </div>
          </Card>
          <Card title="违规行为截图记录">
            <Guirecord :guilist="guilist" />
          </Card>
        </div>
        <div class="screen-right">
          <Card title="视频轮询">
            <template #control>
              <div class="btn">
                <span @click="() => checkoutScreen('one')">一屏</span>
                <span @click="() => checkoutScreen('four')">四屏</span>
              </div>
            </template>
            <div
              class="video-warp"
              :style="{ display: checkSource.length == 1 ? 'block' : 'grid' }"
            >
              <div
                class="video-item"
                :class="{ 'full-box': checkSource.length == 1 }"
                v-for="(it, idx) in checkSource"
                :key="idx"
              >
                <!-- <VideoFlvPlayer :url="it" /> -->
                <VideoFlvPlayer url="ws://111.9.61.248:8072/car/101.live.flv" />
              </div>
            </div>
          </Card>
          <Card title="告警分析">
            <div style="padding: 8px; box-sizing: border-box">
              <pagetitle title="近7日告警数量趋势分析图" />
              <div style="height: 240px">
                <Chart :option="numberTotalOption" />
              </div>
              <pagetitle title="近七日告警类型及数量统计图" />
              <div style="height: 240px">
                <Chart :option="qushiOption" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </v-scale-screen>
</template>
<script lang="ts" setup>
import { ref, onBeforeUnmount, getCurrentInstance } from "vue";
import dayjs from "dayjs";
import VScaleScreen from "v-scale-screen";
import { UranusMqtt } from "/@/mqttC";
import * as echarts from "echarts";

import Card from "../components/Card.vue";
import Total from "../components/Total.vue";
import Guirecord from "../components/Guirecord.vue";
import ScrollTable from "/@/components/ScrollTable.vue";
import Chart from "/@/components/Chart.vue";
import menu from "/@/assets/images/icons/menu-kai.svg";
import curCame1 from "/@/assets/images/yuan1.png";
import curCame from "/@/assets/images/yuan2.png";
import pagetitle from "../components/pagetitle.vue";
import { message } from "ant-design-vue";
import topic from "/@/config/index.ts";
import VideoFlvPlayer from "/@/components/VideoFlvPlayer.vue";
// 就是上面显示的配置文件
import china from "/@/config/china.json";

const currentDate = ref(dayjs().format("YYYY/MM/DD HH:mm:ss"));
const instance = getCurrentInstance();
const timer = ref<any>(null);
const refreshDate = () => {
  timer.value = setInterval(() => {
    currentDate.value = dayjs().format("YYYY/MM/DD HH:mm:ss");
  }, 1000);
};
refreshDate();

// 初始mqtt
const mqqttClient = ref(null);

const initQtt = (call: () => void) => {
  mqqttClient.value = new UranusMqtt("ws://111.9.61.248:28083/mqtt", {
    clientId: "mqttx_d86e7e91",
    username: "",
    password: "",
  });
  mqqttClient.value.initMqtt();

  // 服务状态
  const key = "updatable";
  message.loading({
    content: "客户端正在连接,请稍等....",
    key,
  });
  mqqttClient.value.on("onStatus", (statusOptions: any) => {
    // @TODO: 异常case
    // @TODO: 异常case
    console.log("链接状态=========================", statusOptions);
    if (statusOptions.status != "close") {
      message.success({ content: "客户端已连接", key, duration: 2 });
    } else {
      message.loading({ content: "监听中...", key, duration: 2 });
    }
  });

  // 接受消息
  mqqttClient.value.on("onMessageMqtt", (e) => {
    console.log("客户端消息", e);
    call(e);
  });

  if (mqqttClient.value) {
    mqqttClient.value.subscribeMqtt(topic.camera);
    mqqttClient.value.subscribeMqtt(topic.monthWarning);
    mqqttClient.value.subscribeMqtt(topic.warnings);

    mqqttClient.value.subscribeMqtt(topic.system);
    mqqttClient.value.subscribeMqtt(topic.map);
    mqqttClient.value.subscribeMqtt(topic.warningTotal);

    mqqttClient.value.subscribeMqtt(topic.video);
    mqqttClient.value.subscribeMqtt(topic.warninganalyze);
    mqqttClient.value.subscribeMqtt(topic.seveTotal);
  }
};
// 摄像头管理
const cameraList = ref([
  {
    label: "当前在线数量",
    value: 0,
    src: curCame1,
  },
  {
    label: "摄像头总数",
    value: 0,
    src: curCame,
  },
]);
// 本月预警事件统计
var data = ref([
    {
      name: "电动车识别",
      value: 0,
    },
    {
      name: "挡板检测",
      value: 0,
    },
    {
      name: "工作服识别",
      value: 0,
    },
    {
      name: "打架检测",
      value: 0,
    },
    {
      name: "传送带异物检测",
      value: 0,
    },
    {
      name: "睡岗检测",
      value: 0,
    },
    {
      name: "安全带检测",
      value: 0,
    },
    {
      name: "扶梯大件行李检测",
      value: 0,
    },
    {
      name: "耳罩识别",
      value: 0,
    },
    {
      name: "占道检测",
      value: 0,
    },
  ]),
  names = ref([]),
  values = ref([]);
data.value.forEach((item) => {
  names.value.push(item.name);
  values.value.push(item.value);
});
const warnSource = ref([]);
const column = ref([
  {
    key: "index",
    title: "序号",
  },
  {
    key: "time",
    title: "时间",
  },
  {
    key: "address",
    title: "地点",
  },
  {
    key: "type",
    title: "事件类型",
  },
]);
const option = ref({
  backgroundColor: "transparent",
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
  },
  grid: {
    left: 20,
    right: 40,
    top: 20,
    bottom: 20,
    containLabel: true,
  },
  xAxis: {
    type: "value",
    splitNumber: 3,
    axisTick: {
      show: false,
    },
    axisLine: {
      show: false,
    },
    axisLabel: {
      textStyle: {
        color: "#fff",
        fontSize: 14,
      },
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: "#2b4680",
      },
    },
  },
  yAxis: {
    type: "category",
    data: names.value,
    axisTick: {
      show: false,
      alignWithLabel: true,
    },
    axisLine: {
      show: false,
    },
    axisLabel: {
      interval: 0,
      // rotate: 30,
      textStyle: {
        color: "#fff",
        fontSize: 14,
      },
    },
    splitLine: {
      show: false,
    },
  },
  series: [
    {
      type: "bar",
      showBackground: true,
      backgroundStyle: {
        color: "#2b4680",
      },
      itemStyle: {
        borderRadius: 0,
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: "#347CDD" }, // 0% 处的颜色
            { offset: 1, color: "#21ddff" }, // 100% 处的颜色
          ],
          global: false, // 缺省为 false
        },
      },
      label: {
        show: true,
        position: "right",
        color: "#fff",
        fontSize: 10,
      },
      data: values.value,
    },
  ],
});

const totals = ref([
  {
    label: "服务器数量",
    value: 12123,
    src: "dot8",
  },
  {
    label: "数据集总量",
    value: 0,
    src: "dot1",
  },
  {
    label: "今日推送数据总数",
    value: 0,
    src: "dot2",
  },
  {
    label: "已标注数据总量",
    value: 0,
    src: "dot3",
  },
  {
    label: "任务总量",
    value: 0,
    src: "dot4",
  },
  {
    label: "模型训练数量",
    value: 0,
    src: "dot5",
  },
  {
    label: "模型部署数量",
    value: 0,
    src: "dot6",
  },
  {
    label: "镜像数量",
    value: 0,
    src: "dot7",
  },
]);

const guilist = ref([]);

const source = ref([]);
const checkSource = ref([]);
const checkoutScreen = (type) => {
  checkSource.value = [];
  if (type == "one") {
    checkSource.value = ["ws://111.9.61.248:8072/car/101.live.flv"];
  } else {
    checkSource.value = source.value;
  }
};

//
// 趋势
const qushiData = ref([]);
const numberTotalOption = ref({
  backgroundColor: "transparent",
  tooltip: {
    trigger: "axis",
  },
  grid: {
    top: "15%",
    right: "5%",
    left: "10%",
    bottom: "25%",
  },

  xAxis: [
    {
      name: "",
      type: "category",
      axisLabel: {
        color: "#fff",
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "#fff",
        },
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: "#195384",
          type: "dotted",
        },
      },
      data: qushiData.value.map((it) => it.date),
    },
  ],
  yAxis: [
    {
      type: "value",
      name: "",
      min: 0,
      position: "left",
      nameTextStyle: {
        color: "#fff",
        fontSize: 11,
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "#fff",
        },
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "#0a3e98",
          type: "dotted",
        },
      },
      axisLabel: {
        formatter: "{value}",
        textStyle: {
          color: "#fff",
        },
      },
    },
  ],
  series: [
    {
      name: "销量",
      type: "line",
      // smooth: true, //是否平滑
      showAllSymbol: true,
      // symbol: 'image://./static/images/guang-circle.png',
      symbol: "circle",
      symbolSize: 10,
      lineStyle: {
        normal: {
          color: "#7F4CEF",
        },
      },
      label: {
        show: true,
        position: "top",
        textStyle: {
          color: "#fff",
        },
      },
      itemStyle: {
        color: "#fff",
        borderColor: "#7F4CEF",
        borderWidth: 3,
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(
            0,
            0,
            0,
            1,
            [
              {
                offset: 0,
                color: "RGBA(127, 76, 239, 1)",
              },
              {
                offset: 1,
                color: "RGBA(127, 76, 239, 0.2)",
              },
            ],
            false
          ),
          shadowColor: "RGBA(80, 38, 72, 0.2)",
          shadowBlur: 20,
        },
      },
      data: qushiData.value.map((it) => it.count),
    },
  ],
});

//
// 近七日数据
const qushiOption = ref({
  backgroundColor: "transparent",
  legend: {
    orient: "vertical",
    top: "center",
    right: "5%",
    itemWidth: 5,
    itemHeight: 5,
    data: [
      "电动车识别",
      "动物检测",
      "挡板检测",
      "工作服识别",
      "打架检测",
      "传送带异物检测",
      "睡岗检测",
      "安全带检测",
      "扶梯大行李检测",
      "飞机坦克汽车识别",
    ],
    textStyle: {
      color: "#fff",
      fontSize: 12,
    },
  },
  tooltip: {
    trigger: "item",
    formatter: "{a} <br/>{b} : {c} ({d}%)",
  },
  series: [
    {
      name: "半径模式",
      type: "pie",
      left: "-10%",
      radius: ["30%", "80%"],
      center: ["40%", "50%"],
      roseType: "radius",
      label: {
        show: true,
        normal: {
          position: "outside",
          fontSize: 10,
        },
      },
      labelLine: {
        length: 1,
        length2: 20,
        smooth: true,
      },
      data: [
        {
          value: 0,
          name: "电动车识别",
          itemStyle: {
            color: "rgba(50,123,250,0.7)",
            borderColor: "rgba(50,123,250,0)",
            borderWidth: 3,
          },
        },
        {
          value: 0,
          name: "动物检测",
          itemStyle: {
            color: "rgba(244,201,7,0.7)",
            borderColor: "rgba(244,201,7,0)",
            borderWidth: 3,
          },
        },
        {
          value: 0,
          name: "挡板检测",
          itemStyle: {
            color: "rgba(23,216,161,0.7)",
            borderColor: "rgba(23,216,161,0.7)",
            borderWidth: 3,
          },
        },
        {
          value: 0,
          name: "工作服识别",
          itemStyle: {
            color: "rgba(122,60,235,0.7)",
            borderColor: "rgba(122,60,235,0)",
            borderWidth: 3,
          },
        },
        {
          value: 0,
          name: "打架检测",
          itemStyle: {
            color: "rgba(43,53,63,0.7)",
            borderColor: "rgba(43,53,63,0.7)",
            borderWidth: 1,
          },
        },
        {
          value: 0,
          name: "传送带异物检测",
          itemStyle: {
            color: "rgba(15,187,240,0.7)",
            borderColor: "rgba(15,187,240,0.7)",
            borderWidth: 1,
          },
        },
        {
          value: 0,
          name: "睡岗检测",
          itemStyle: {
            color: "rgba(5,167,180,0.7)",
            borderColor: "rgba(5,167,180,0.7)",
            borderWidth: 1,
          },
        },
        {
          value: 0,
          name: "安全带检测",
          itemStyle: {
            color: "rgba(15,100,142,0.7)",
            borderColor: "rgba(15,100,142,0.7)",
            borderWidth: 1,
          },
        },
        {
          value: 0,
          name: "扶梯大行李检测",
          itemStyle: {
            color: "rgba(45,20,243,0.7)",
            borderColor: "rgba(15,197,243,0)",
            borderWidth: 1,
          },
        },
        {
          value: 0,
          name: "飞机坦克汽车识别",
          itemStyle: {
            color: "rgba(15,25,67,1)",
            borderColor: "rgba(15,25,67,1)",
            borderWidth: 1,
            fontSize: 12,
          },
        },
      ],
    },
  ],
});

// 本月告警情况分析统计图
const warning = ref([
  {
    name: "电动车识别",
    value: 0,
  },
  {
    name: "动物检测",
    value: 0,
  },
  {
    name: "挡板检测",
    value: 0,
  },
  {
    name: "工作服识别",
    value: 0,
  },
  {
    name: "打架检测",
    value: 0,
  },
  {
    name: "传送带异物检测",
    value: 0,
  },
  {
    name: "睡岗检测",
    value: 0,
  },
]);

let arrName = getArrayValue(warning.value, "name");
let arrValue = getArrayValue(warning.value, "value");
let sumValue = eval(arrValue.join("+"));
let optionData = getData(warning.value);

function getArrayValue(array, key) {
  var key = key || "value";
  var res = [];
  if (array) {
    array.forEach(function (t) {
      res.push(t[key]);
    });
  }
  return res;
}

function array2obj(array, key) {
  var resObj = {};
  for (var i = 0; i < array.length; i++) {
    resObj[array[i][key]] = array[i];
  }
  return resObj;
}

function getData(data) {
  var res = {
    series: [],
    yAxis: [],
  };
  for (let i = 0; i < data.length; i++) {
    res.series.push({
      name: "",
      type: "pie",
      clockWise: false, //顺时加载
      hoverAnimation: false, //鼠标移入变大
      radius: [73 - i * 15 + "%", 68 - i * 15 + "%"],
      center: ["50%", "50%"],
      label: {
        show: false,
      },
      itemStyle: {
        label: {
          show: false,
        },
        labelLine: {
          show: false,
        },
        borderWidth: 5,
      },
      data: [
        {
          value: data[i].value,
          name: data[i].name,
        },
        {
          value: sumValue - data[i].value,
          name: "",
          itemStyle: {
            color: "rgba(0,0,0,0)",
            borderWidth: 0,
          },
          tooltip: {
            show: false,
          },
          hoverAnimation: false,
        },
      ],
    });
    res.series.push({
      name: "",
      type: "pie",
      silent: true,
      z: 1,
      clockWise: false, //顺时加载
      hoverAnimation: false, //鼠标移入变大
      radius: [73 - i * 15 + "%", 68 - i * 15 + "%"],
      center: ["50%", "50%"],
      label: {
        show: false,
      },
      itemStyle: {
        label: {
          show: false,
        },
        labelLine: {
          show: false,
        },
        borderWidth: 5,
      },
      data: [
        {
          value: 7.5,
          itemStyle: {
            color: "rgb(3, 31, 62)",
            borderWidth: 0,
          },
          tooltip: {
            show: false,
          },
          hoverAnimation: false,
        },
        {
          value: 2.5,
          name: "",
          itemStyle: {
            color: "rgba(0,0,0,0)",
            borderWidth: 0,
          },
          tooltip: {
            show: false,
          },
          hoverAnimation: false,
        },
      ],
    });
    res.yAxis.push(((data[i].value / sumValue) * 100).toFixed(2) + "%");
  }
  return res;
}

const warningOptions = ref({
  backgroundColor: "transparent",
  legend: {
    show: true,
    icon: "circle",
    // top: "center",
    top: "12%",
    bottom: "53%",
    left: "50%",
    data: arrName,
    itemWidth: 5,
    itemHeight: 5,
    width: 50,
    padding: [0, 5],
    itemGap: 4,
    formatter: function (name) {
      return "{title|" + name + "} {value|" + "}";
    },
    textStyle: {
      rich: {
        title: {
          fontSize: 10,
          lineHeight: 10,
          color: "rgb(0, 178, 246)",
        },
        value: {
          fontSize: 10,
          lineHeight: 20,
          color: "#fff",
        },
      },
    },
  },
  tooltip: {
    show: true,
    trigger: "item",
    formatter: "{a}<br>{b}:{c}({d}%)",
  },
  color: [
    "rgb(9,187,247)",
    "rgb(184,254,165)",
    "rgb(253,218,23)",
    "rgb(252,152,12)",
  ],
  xAxis: [
    {
      show: false,
    },
  ],
  series: optionData.series,
});

//
/*获取地图数据*/
let mapName = "china";

let geoCoordMap = {};
let toolTipData = ref([
  {
    name: "湖南",
    value: 25,
    areas: ["长沙", "株洲", "益阳"],
  },
  {
    name: "安徽",
    value: 3,
    // areas: ["合肥", "芜湖"],
  },
  {
    name: "山东",
    value: 80,
    // areas: ["济南", "青岛", "淄博", "烟台", "威海", "临沂"],
  },
  {
    name: "四川",
    value: 0,
    // areas: ["成都", "攀枝花", "乐山", "泸州"],
  },
  {
    name: "云南",
    value: 0,
    // areas: ["昆明", "玉溪", "丽江", "普洱", "临沧"],
  },
  {
    name: "黑龙江",
    value: 0,
    // areas: ["哈尔滨", "鹤岗", "黑河", "绥化", "大庆", "佳木斯"],
  },
  {
    name: "甘肃",
    value: 0,
    // areas: ["兰州", "嘉峪关", "天水", "酒泉"],
  },
]);
/*获取地图数据*/
const echart = instance?.appContext.config.globalProperties.$echarts;
echart.registerMap("china", china);
var mapFeatures = echarts.getMap(mapName).geoJson.features;
mapFeatures.forEach(function (v) {
  // 地区名称
  var name = v.properties.name;
  // 地区经纬度
  geoCoordMap[name] = v.properties.cp;
});

var convertData = function (data) {
  var res = [];
  for (var i = 0; i < data.length; i++) {
    var geoCoord = geoCoordMap[data[i].name];
    if (geoCoord) {
      res.push({
        name: data[i].name,
        value: geoCoord.concat(data[i].value),
      });
    }
  }
  return res;
};
const Mapoption = ref({
  backgroundColor: "transparent",
  title: {
    show: true,
    // text: "项目分布图",
    x: "center",
    top: "10",
    textStyle: {
      color: "#fff",
      fontFamily: "等线",
      fontSize: 18,
    },
  },
  tooltip: {
    trigger: "item",
    formatter: function (params) {
      if (typeof params.value[2] == "undefined") {
        var toolTiphtml = "";
        for (var i = 0; i < toolTipData.value.length; i++) {
          if (params.name == toolTipData.value[i].name) {
            toolTiphtml +=
              toolTipData.value[i].name + "：" + toolTipData.value[i].value;
          }
        }
        console.log(toolTiphtml);
        // console.log(convertData(data))
        return toolTiphtml;
      } else {
        var toolTiphtml = "";
        for (var i = 0; i < toolTipData.value.length; i++) {
          if (params.name == toolTipData.value[i].name) {
            toolTiphtml +=
              toolTipData.value[i].name + "：" + toolTipData.value[i].value;
          }
        }
        console.log(toolTiphtml);

        return toolTiphtml;
      }
    },
    backgroundColor: "#f4e925",
    borderColor: "#f4e925",
    padding: [5, 10],
    textStyle: {
      color: "#333",
      fontSize: "16",
    },
  },
  geo: {
    show: true,
    map: "china",
    label: {
      normal: {
        show: false,
      },
      emphasis: {
        show: false,
      },
    },
    // roam: false,//地图设置不可拖拽，固定的
    itemStyle: {
      normal: {
        areaColor: "#1D346F",
        borderWidth: 0,
        shadowColor: "#D79D3D",
        shadowBlur: 30,
        shadowOffsetX: -5,
        shadowOffsetY: 10,
      },
      emphasis: {
        areaColor: "#2a333d",
      },
    },
  },
  series: [
    {
      type: "map",
      map: "china",
      geoIndex: 1,
      label: {
        normal: {
          show: false,
        },
        emphasis: {
          show: false,
          textStyle: {
            color: "#fff",
          },
        },
      },
      roam: true,
      itemStyle: {
        normal: {
          areaColor: "#1D346F",
          borderColor: "#D79D3D",
        },
        emphasis: {
          areaColor: "#0f2c70",
        },
      },
    },
    {
      name: "",
      type: "effectScatter",
      coordinateSystem: "geo",
      data: convertData(toolTipData.value),
      symbolSize: function (val) {
        return 15;
      },
      showEffectOn: "render",
      rippleEffect: {
        brushType: "stroke",
      },
      label: {
        normal: {
          formatter: "{b}",
          position: "right",
          fontSize: "12",
          show: true,
        },
      },
      itemStyle: {
        normal: {
          color: "#f4e925",
          shadowBlur: 10,
          shadowColor: "#333",
        },
      },
    },
  ],
});
initQtt((e) => {
  // 摄像头管理
  if (e.topic == topic.camera) {
    const payload = e.payload;
    cameraList.value = [
      {
        label: "当前在线数量",
        value: payload.currentCount || "0",
        src: curCame1,
      },
      {
        label: "摄像头总数",
        value: payload.shexiangtouCount || "0",
        src: curCame,
      },
    ];
  }
  // 本月预警事件前十
  if (e.topic === topic.monthWarning) {
    const payload = e.payload;
    data.value = [
      {
        name: "电动车识别",
        value: payload.diandongchecheck || 0,
      },
      {
        name: "挡板检测",
        value: payload.dangbancheck || 0,
      },
      {
        name: "工作服识别",
        value: payload.gongzuofucheck || 0,
      },
      {
        name: "打架检测",
        value: payload.dajiacheck || 0,
      },
      {
        name: "传送带异物检测",
        value: payload.chuansongdaiyiwucheck || 0,
      },
      {
        name: "睡岗检测",
        value: payload.shuigangcheck || 0,
      },
      {
        name: "安全带检测",
        value: payload.anquandaicheck || 0,
      },
      {
        name: "扶梯大件行李检测",
        value: payload.futidajiancheck || 0,
      },
      {
        name: "耳罩识别",
        value: payload.erzhaocheck || 0,
      },
      {
        name: "占道检测",
        value: payload.zhandaocheck || 0,
      },
    ];
    option.value = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      grid: {
        left: 20,
        right: 40,
        top: 20,
        bottom: 20,
        containLabel: true,
      },
      xAxis: {
        type: "value",
        splitNumber: 3,
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          textStyle: {
            color: "#fff",
            fontSize: 14,
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#2b4680",
          },
        },
      },
      yAxis: {
        type: "category",
        data: data.value.map((it) => it.name),
        axisTick: {
          show: false,
          alignWithLabel: true,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          interval: 0,
          // rotate: 30,
          textStyle: {
            color: "#fff",
            fontSize: 14,
          },
        },
        splitLine: {
          show: false,
        },
      },
      series: [
        {
          type: "bar",
          showBackground: true,
          backgroundStyle: {
            color: "#2b4680",
          },
          itemStyle: {
            borderRadius: 0,
            color: {
              type: "linear",
              // x: 0,
              // y: 0,
              // x2: 1,
              // y2: 0,
              colorStops: [
                // { offset: 0, color: "#000" }, // 0% 处的颜色
                { offset: 1, color: "#21ddff" }, // 100% 处的颜色
              ],
              global: false, // 缺省为 false
            },
          },
          label: {
            show: true,
            position: "right",
            color: "#21ddff",
            fontSize: 10,
          },
          data: data.value.map((it) => it.value),
        },
      ],
    };

    //
    warning.value = [
      {
        name: "电动车识别",
        value: payload.diandongchecheck || 0,
      },
      {
        name: "动物检测",
        value: 0,
      },
      {
        name: "挡板检测",
        value: payload.dangbancheck || 0,
      },
      {
        name: "工作服识别",
        value: payload.gongzuofucheck || 0,
      },
      {
        name: "打架检测",
        value: payload.dajiacheck || 0,
      },
      {
        name: "传送带异物检测",
        value: payload.chuansongdaiyiwucheck || 0,
      },
      {
        name: "睡岗检测",
        value: payload.shuigangcheck || 0,
      },
    ];
    let arrName = getArrayValue(warning.value, "name");
    let arrValue = getArrayValue(warning.value, "value");
    let sumValue = eval(arrValue.join("+"));
    let optionData = getData(warning.value);
    function getArrayValue(array, key) {
      var key = key || "value";
      var res = [];
      if (array) {
        array.forEach(function (t) {
          res.push(t[key]);
        });
      }
      return res;
    }
    function getData(data) {
      var res = {
        series: [],
        yAxis: [],
      };
      for (let i = 0; i < data.length; i++) {
        res.series.push({
          name: "",
          type: "pie",
          clockWise: false, //顺时加载
          hoverAnimation: false, //鼠标移入变大
          radius: [73 - i * 15 + "%", 68 - i * 15 + "%"],
          center: ["50%", "50%"],
          label: {
            show: false,
          },
          itemStyle: {
            label: {
              show: false,
            },
            labelLine: {
              show: false,
            },
            borderWidth: 5,
          },
          data: [
            {
              value: data[i].value,
              name: data[i].name,
            },
            {
              value: sumValue - data[i].value,
              name: "",
              itemStyle: {
                color: "rgba(0,0,0,0)",
                borderWidth: 0,
              },
              tooltip: {
                show: false,
              },
              hoverAnimation: false,
            },
          ],
        });
        res.series.push({
          name: "",
          type: "pie",
          silent: true,
          z: 1,
          clockWise: false, //顺时加载
          hoverAnimation: false, //鼠标移入变大
          radius: [73 - i * 15 + "%", 68 - i * 15 + "%"],
          center: ["50%", "50%"],
          label: {
            show: false,
          },
          itemStyle: {
            label: {
              show: false,
            },
            labelLine: {
              show: false,
            },
            borderWidth: 5,
          },
          data: [
            {
              value: 7.5,
              itemStyle: {
                color: "rgb(3, 31, 62)",
                borderWidth: 0,
              },
              tooltip: {
                show: false,
              },
              hoverAnimation: false,
            },
            {
              value: 2.5,
              name: "",
              itemStyle: {
                color: "rgba(0,0,0,0)",
                borderWidth: 0,
              },
              tooltip: {
                show: false,
              },
              hoverAnimation: false,
            },
          ],
        });
        res.yAxis.push(((data[i].value / sumValue) * 100).toFixed(2) + "%");
      }
      return res;
    }

    warningOptions.value = {
      backgroundColor: "transparent",
      legend: {
        show: true,
        icon: "circle",
        // top: "center",
        top: "12%",
        bottom: "53%",
        left: "50%",
        data: arrName,
        itemWidth: 5,
        itemHeight: 5,
        width: 50,
        padding: [0, 5],
        itemGap: 4,
        formatter: function (name) {
          return "{title|" + name + "} {value|" + "}";
        },
        textStyle: {
          rich: {
            title: {
              fontSize: 10,
              lineHeight: 10,
              color: "rgb(0, 178, 246)",
            },
            value: {
              fontSize: 10,
              lineHeight: 20,
              color: "#fff",
            },
          },
        },
      },
      tooltip: {
        show: true,
        trigger: "item",
        formatter: "{a}<br>{b}:{c}({d}%)",
      },
      color: [
        "rgb(9,187,247)",
        "rgb(184,254,165)",
        "rgb(253,218,23)",
        "rgb(252,152,12)",
      ],
      xAxis: [
        {
          show: false,
        },
      ],
      series: optionData.series,
    };
  }

  if (e.topic === topic.warnings) {
    warnSource.value = e.payload.alertData || [];
  }
  // 系统管理
  if (e.topic === topic.system) {
    const payload = e.payload;
    totals.value = [
      {
        label: "服务器数量",
        value: payload.servercount || "0",
        src: "dot8",
      },
      {
        label: "数据集总量",
        value: payload.datacount || "0",
        src: "dot1",
      },
      {
        label: "今日推送数据总数",
        value: payload.tuisongcount || "0",
        src: "dot2",
      },
      {
        label: "已标注数据总量",
        value: payload.biaozhucount || "0",
        src: "dot3",
      },
      {
        label: "任务总量",
        value: payload.taskcount || "0",
        src: "dot4",
      },
      {
        label: "模型训练数量",
        value: payload.modelcount || "0",
        src: "dot5",
      },
      {
        label: "模型部署数量",
        value: payload.modelbushucount || "0",
        src: "dot6",
      },
      {
        label: "镜像数量",
        value: payload.jingxiangcount || "0",
        src: "dot7",
      },
    ];
  }

  if (e.topic === topic.weigui) {
    const payload = e.payload.alertData;
    guilist.value = payload;
  }

  // 视频轮询
  if (e.topic === topic.video) {
    const payload = e.payload.url;
    source.value = payload || [];
    checkSource.value = [payload[0]];
  }

  if (e.topic === topic.warninganalyze) {
    const payload = e.payload.data;
    qushiData.value = payload;
    console.log("exxxx================", payload, qushiData.value);
    numberTotalOption.value = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
      },
      grid: {
        top: "15%",
        right: "5%",
        left: "10%",
        bottom: "25%",
      },

      xAxis: [
        {
          name: "",
          type: "category",
          axisLabel: {
            color: "#fff",
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: "#fff",
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
            lineStyle: {
              color: "#195384",
              type: "dotted",
            },
          },
          data: qushiData.value.map((it) => it.date),
        },
      ],
      yAxis: [
        {
          type: "value",
          name: "",
          min: 0,
          position: "left",
          nameTextStyle: {
            color: "#fff",
            fontSize: 11,
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: "#fff",
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: "#0a3e98",
              type: "dotted",
            },
          },
          axisLabel: {
            formatter: "{value}",
            textStyle: {
              color: "#fff",
            },
          },
        },
      ],
      series: [
        {
          name: "销量",
          type: "line",
          // smooth: true, //是否平滑
          showAllSymbol: true,
          // symbol: 'image://./static/images/guang-circle.png',
          symbol: "circle",
          symbolSize: 10,
          lineStyle: {
            normal: {
              color: "#7F4CEF",
            },
          },
          label: {
            show: true,
            position: "top",
            textStyle: {
              color: "#fff",
            },
          },
          itemStyle: {
            color: "#fff",
            borderColor: "#7F4CEF",
            borderWidth: 3,
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(
                0,
                0,
                0,
                1,
                [
                  {
                    offset: 0,
                    color: "RGBA(127, 76, 239, 1)",
                  },
                  {
                    offset: 1,
                    color: "RGBA(127, 76, 239, 0.2)",
                  },
                ],
                false
              ),
              shadowColor: "RGBA(80, 38, 72, 0.2)",
              shadowBlur: 20,
            },
          },
          data: qushiData.value.map((it) => it.count),
        },
      ],
    };
  }

  if (e.topic === topic.seveTotal) {
    const payload = e.payload;
    qushiOption.value = {
      backgroundColor: "transparent",
      legend: {
        orient: "vertical",
        top: "center",
        right: "5%",
        itemWidth: 5,
        itemHeight: 5,
        data: [
          "电动车识别",
          "动物检测",
          "挡板检测",
          "工作服识别",
          "打架检测",
          "传送带异物检测",
          "睡岗检测",
          "安全带检测",
          "扶梯大行李检测",
          "飞机坦克汽车识别",
        ],
        textStyle: {
          color: "#fff",
          fontSize: 12,
        },
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)",
      },
      series: [
        {
          name: "半径模式",
          type: "pie",
          left: "-10%",
          radius: ["30%", "80%"],
          center: ["40%", "50%"],
          roseType: "radius",
          label: {
            show: true,
            normal: {
              position: "outside",
              fontSize: 10,
            },
          },
          labelLine: {
            length: 1,
            length2: 20,
            smooth: true,
          },
          data: [
            {
              value: payload.diandongchecheck || 0,
              name: "电动车识别",
              itemStyle: {
                color: "rgba(50,123,250,0.7)",
                borderColor: "rgba(50,123,250,0)",
                borderWidth: 3,
              },
            },
            {
              value: payload.diandongchecheck || 0,
              name: "动物检测",
              itemStyle: {
                color: "rgba(244,201,7,0.7)",
                borderColor: "rgba(244,201,7,0)",
                borderWidth: 3,
              },
            },
            {
              value: payload.diandongchecheck || 0,
              name: "挡板检测",
              itemStyle: {
                color: "rgba(23,216,161,0.7)",
                borderColor: "rgba(23,216,161,0.7)",
                borderWidth: 3,
              },
            },
            {
              value: payload.diandongchecheck || 0,
              name: "工作服识别",
              itemStyle: {
                color: "rgba(122,60,235,0.7)",
                borderColor: "rgba(122,60,235,0)",
                borderWidth: 3,
              },
            },
            {
              value: payload.diandongchecheck || 0,
              name: "打架检测",
              itemStyle: {
                color: "rgba(43,53,63,0.7)",
                borderColor: "rgba(43,53,63,0.7)",
                borderWidth: 1,
              },
            },
            {
              value: payload.diandongchecheck || 0,
              name: "传送带异物检测",
              itemStyle: {
                color: "rgba(15,187,240,0.7)",
                borderColor: "rgba(15,187,240,0.7)",
                borderWidth: 1,
              },
            },
            {
              value: payload.diandongchecheck || 0,
              name: "睡岗检测",
              itemStyle: {
                color: "rgba(5,167,180,0.7)",
                borderColor: "rgba(5,167,180,0.7)",
                borderWidth: 1,
              },
            },
            {
              value: payload.diandongchecheck || 0,
              name: "安全带检测",
              itemStyle: {
                color: "rgba(15,100,142,0.7)",
                borderColor: "rgba(15,100,142,0.7)",
                borderWidth: 1,
              },
            },
            {
              value: payload.diandongchecheck || 0,
              name: "扶梯大行李检测",
              itemStyle: {
                color: "rgba(45,20,243,0.7)",
                borderColor: "rgba(15,197,243,0)",
                borderWidth: 1,
              },
            },
            {
              value: payload.diandongchecheck || 0,
              name: "飞机坦克汽车识别",
              itemStyle: {
                color: "rgba(15,25,67,1)",
                borderColor: "rgba(15,25,67,1)",
                borderWidth: 1,
                fontSize: 12,
              },
            },
          ],
        },
      ],
    };
  }

  if (e.topic === topic.map) {
    const payload = e.payload.data;

    toolTipData.value = payload;
    Mapoption.value = {
      backgroundColor: "transparent",
      title: {
        show: true,
        // text: "项目分布图",
        x: "center",
        top: "10",
        textStyle: {
          color: "#fff",
          fontFamily: "等线",
          fontSize: 18,
        },
      },
      tooltip: {
        trigger: "item",
        formatter: function (params) {
          if (typeof params.value[2] == "undefined") {
            var toolTiphtml = "";
            for (var i = 0; i < toolTipData.value.length; i++) {
              if (params.name == toolTipData.value[i].name) {
                toolTiphtml +=
                  toolTipData.value[i].name + "：" + toolTipData.value[i].value;
              }
            }
            console.log(toolTiphtml);
            // console.log(convertData(data))
            return toolTiphtml;
          } else {
            var toolTiphtml = "";
            for (var i = 0; i < toolTipData.value.length; i++) {
              if (params.name == toolTipData.value[i].name) {
                toolTiphtml +=
                  toolTipData.value[i].name + "：" + toolTipData.value[i].value;
              }
            }
            console.log(toolTiphtml);

            return toolTiphtml;
          }
        },
        backgroundColor: "#f4e925",
        borderColor: "#f4e925",
        padding: [5, 10],
        textStyle: {
          color: "#333",
          fontSize: "16",
        },
      },
      geo: {
        show: true,
        map: "china",
        label: {
          normal: {
            show: false,
          },
          emphasis: {
            show: false,
          },
        },
        // roam: false,//地图设置不可拖拽，固定的
        itemStyle: {
          normal: {
            areaColor: "#1D346F",
            borderWidth: 0,
            shadowColor: "#D79D3D",
            shadowBlur: 30,
            shadowOffsetX: -5,
            shadowOffsetY: 10,
          },
          emphasis: {
            areaColor: "#2a333d",
          },
        },
      },
      series: [
        {
          type: "map",
          map: "china",
          geoIndex: 1,
          label: {
            normal: {
              show: false,
            },
            emphasis: {
              show: false,
              textStyle: {
                color: "#fff",
              },
            },
          },
          roam: true,
          itemStyle: {
            normal: {
              areaColor: "#1D346F",
              borderColor: "#D79D3D",
            },
            emphasis: {
              areaColor: "#0f2c70",
            },
          },
        },
        {
          name: "工业二氧化硫",
          type: "effectScatter",
          coordinateSystem: "geo",
          data: convertData(toolTipData.value),
          symbolSize: function (val) {
            return 15;
          },
          showEffectOn: "render",
          rippleEffect: {
            brushType: "stroke",
          },
          label: {
            normal: {
              formatter: "{b}",
              position: "right",
              fontSize: "12",
              show: true,
            },
          },
          itemStyle: {
            normal: {
              color: "#f4e925",
              shadowBlur: 10,
              shadowColor: "#333",
            },
          },
        },
      ],
    };
  }
});

// chartMap

// var mapFeatures = echarts.getMap("china").geoJson.features;
// mapFeatures.forEach(function (v) {
//   // 地区名称
//   var name = v.properties.name;
//   // 地区经纬度
//   geoCoordMap[name] = v.properties.cp;
// });

// var convertData = function (data) {
//   var res = [];
//   for (var i = 0; i < data.length; i++) {
//     var geoCoord = geoCoordMap[data[i].name];
//     if (geoCoord) {
//       res.push({
//         name: data[i].name,
//         value: geoCoord.concat(data[i].value),
//       });
//     }
//   }
//   return res;
// };

// 视频轮询

onBeforeUnmount(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});
</script>
<style lang="less" scoped>
.screen-container {
  background: url("../assets/images/main-bg.png") no-repeat center / 100%;
  height: 100%;
  width: 100%;
  color: #fff;
  position: relative;
  .screen-header {
    position: relative;
    height: 120px;

    background: red;
    background: url("../assets/images/header.png") no-repeat center / 100%;
    background-size: 100% 100%;
    // border-bottom: 1px solid red;
    .title {
      position: absolute;
      display: inline-block;
      font-size: 35px;
      font-weight: bold;
      left: 50%;
      top: 15%;
      transform: translateX(-50%);
    }
    .menu {
      position: absolute;
      top: 30%;
      right: 1.2%;
      width: 30px;
      height: 20px;
      cursor: pointer;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .time {
      position: absolute;
      font-size: 20px;
      font-weight: 400;
      top: 70%;
      right: 1%;
      width: 500px;
      text-align: right;
      color: #226fb9;
    }
  }
  .screen-content {
    height: calc(100% - 120px);
    display: flex;

    .screen-left {
      width: 450px;
      height: 100%;
      padding: 0 12px 12px 12px;
      box-sizing: border-box;
      // border: 1px solid red;
      .came {
        display: flex;
        justify-content: space-around;
        min-height: 150px;
        align-items: center;
      }
      .camera-box {
        width: 120px;
        height: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        p {
          margin: 0;
        }
        .value {
          font-size: 22px;
        }
        .dot {
          font-size: 10px;
          margin-left: 4px;
        }
        .desc {
          margin: 0;
          font-size: 10px;
        }
      }
    }
    .screen-middle {
      padding: 0 12px 12px 12px;
      box-sizing: border-box;
      flex: 1;
      width: 800px;
      height: 100%;
      // border: 1px solid red;
      .left {
        height: 300px;
      }
      .right {
        width: calc(100% - 300px);
        height: 300px;
      }
    }
    .screen-right {
      padding: 0 12px 12px 12px;
      width: 600px;
      height: 100%;
      // border: 1px solid red;
    }
  }
}
.chart {
  width: 100%;
  height: 300px;
}
.btn {
  width: 100px;
  height: 100%;
  background-color: #499de0;
  border-radius: 20px;
  padding: 4px 8px;
  font-style: normal;
  font-size: 18px;
  display: flex;
  box-sizing: border-box;
  justify-content: space-between;
  span {
    cursor: pointer;
  }
}
.video-item {
  // width: 49%;

  // background: #ccc;
}
.video-warp {
  // display: flex;
  // flex-wrap: wrap;
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  grid-template-columns: repeat(2, 1fr);
  grid-row-gap: 5px; // 行间隙
  grid-column-gap: 5px; // 列间隙
  height: 290px;
}
.full-box {
  width: 100%;
  height: 290px;
  // .video-item {
  //   width: 50% !important;
  //   margin: 0 !important;
  // }
}
</style>