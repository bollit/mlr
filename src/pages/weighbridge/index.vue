<template>
  <div>
    <div style="background: #ececec; padding: 30px">
      <a-flex horizontal>
        <a-card title="地磅实时重量" :bordered="false" style="width: 30%">
          <a-list>
            <a-list-item class="outBridgeTime"
              ><div class="bridgeTime">{{ mqqtDateCarW }}吨</div></a-list-item
            >
          </a-list>
          <a-list size="small" :data-source="[mqqtDateCar]">
            <a-list-item>过磅时间：{{ time2 }} </a-list-item>
            <a-list-item>车牌号：{{ valueLin }}</a-list-item>
            <a-list-item
              >车头照片：
              <a-image
                style="width: 300px"
                :src="'data:image/png;base64,' + pic"
                alt=""
              />
            </a-list-item>
          </a-list>
          <a-button
            style="margin: 18px; height: 50px"
            type="primary"
            @click="handleIn"
            >进场过磅确认</a-button
          >
          <a-button
            style="margin: 18px; height: 50px"
            type="primary"
            @click="handleOut"
            >出场过磅确认</a-button
          >
        </a-card>
        <a-card title="实时摄像" bordered="false" style="width: 70%">
          <a-flex gap="middle">
            <VideoPlayer style="width: 50%; height: 500px" :url="videoUrl" />
            <VideoPlayer style="width: 50%; height: 500px" :url="videoUrlOut" />
          </a-flex>
        </a-card>
      </a-flex>
      <a-flex gap="middle" horizontal>
        <a-card title="过磅记录" :bordered="false" style="width: 100%">
          <a-form layout="inline" style="margin: 0 0 16px 0">
            <a-form-item>
              <a-input
                placeholder="请输入磅单编码、车牌号检索"
                v-model:value="plateNumber"
              >
              </a-input>
            </a-form-item>
            <a-form-item label="状态：">
              <a-select
                ref="select"
                v-model:value="searchValue"
                style="width: 120px"
                @focus="focus"
                @change="handleChange"
              >
                <a-select-option value="0">全部</a-select-option>
                <a-select-option value="1">待出场</a-select-option>
                <a-select-option value="2">已完成</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click.native="onSearch">查询</a-button>
              <a-button @click="onReset" style="margin: 0 0 0 16px"
                >重置</a-button
              >
            </a-form-item>
          </a-form>
          <a-table
            :dataSource="dataSourceRecoList"
            :columns="columnsRecoList"
            :pagination="false"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key == 'approachDate'">
                {{ new Date(record.approachDate).toLocaleString() }}
              </template>
              <template v-if="column.key == 'exitDate'">
                {{ new Date(record.exitDate).toLocaleString() }}
              </template>
              <template v-if="column.key === 'pic'">
                <a-image
                  :width="150"
                  :src="'data:image/png;base64,' + record.pic"
                />
              </template>
              <template v-if="column.key === 'exitPic'">
                <a-image
                  :width="150"
                  :src="'data:image/png;base64,' + record.exitPic"
                />
              </template>
              <template v-if="column.key == 'status'"
                >{{
                  record.type == 0
                    ? "待出场"
                    : record.type == 1
                    ? "已完成"
                    : "其他"
                }}
              </template>
            </template>
          </a-table>
          <!-- 分页 -->
          <a-pagination
            :total="totalList"
            v-model:current="current"
            @change="onChangePage"
            show-less-items
            style="margin-top: 16px"
          />
        </a-card>
      </a-flex>
    </div>
  </div>
</template>

<script lang="ts">
import { UranusMqtt } from "/@/mqttC";
import topic from "/@/config/index.ts";
import china from "/@/config/china.json";
// 车牌识别摄像头：ws://111.9.61.248:8072/car/101.live.flv
import { apiRequest } from "../../api/api";
// import { apiRequestAxios } from "../../api/axios";
// import VideoFlvPlayer from "../../components/VideoFlvPlayer.vue";
import VideoPlayer from "/@/components/VideoPlayer.vue";
import { Button, Card, Form, message } from "ant-design-vue";
import { defineComponent, nextTick, onMounted, ref } from "vue";
import { Dayjs } from "dayjs";
import { UserOutlined } from "@ant-design/icons-vue";

import type { SelectProps } from "ant-design-vue";
import { Axis } from "echarts";
// 进
const videoUrl = ref("ws://111.9.61.248:8072/car/101.live.flv");
// 出
const videoUrlOut = ref("ws://111.9.61.248:8072/face/h265.live.flv");
type RangeValue = [Dayjs, Dayjs];

export default defineComponent({
  name: "App",
  components: {
    Button,
    Card,
    Form,
    UserOutlined,
    VideoPlayer,
  },
  setup() {
    const data = ref<any>(null);
    const error = ref<string | null>(null);
    const dataRecoList = ref<any>(null);
    const errorRecoList = ref<string | null>(null);

    const plateNumber = ref<string>("");
    const valuePicker = ref<RangeValue>();

    const status = ref<string>("");

    const searchValue = ref("");
    const options1 = ref<SelectProps["options"]>([
      {
        value: "",
        label: "全部",
      },
      {
        value: "1",
        label: "待出场",
      },
      {
        value: "2",
        label: "已完成",
      },
    ]);
    const focus = () => {
      console.log("focus");
    };

    const handleChange = (searchValue: string) => {
      console.log(`selected ${searchValue}`);
    };

    const getMake = async () => {
      try {
        const response = await apiRequest<any>(
          "VehicleReservationTaskList",
          "/dde/cqrs",
          "POST",
          {
            page: 1,
            size: 10,
          }
        );
        data.value = response.data.content || [];
        error.value = null;
      } catch (err: any) {
        error.value = err.message;
        data.value = [];
      }
    };

    const approachDate = ref<string>("");
    const exitDate = ref<string>("");
    const current = ref<string>("1");
    const totalList = ref<string>("");

    // 获取过磅记录列表
    const getRecoList = async (plateNumber: string, status: string) => {
      try {
        const response = await apiRequest<any>(
          "WeighbridgeRecordList",
          "/dde/cqrs",
          "POST",
          {
            page: current.value,
            size: 5,
            // plateNumber,
            queryName: plateNumber,
            status,
            // serialNumber: plateNumber,
          }
        );

        dataRecoList.value = response.data.content || [];
        totalList.value = response.data.total;

        errorRecoList.value = null;

        // if (response.data.content.approachDate != null) {
        //   console.log(response.data.content.approachDate);

        //   approachDate.value = formatTimestamp(
        //     response.data.content.approachDate
        //   );
        // }
        // if (response.data.content.exitDate != null) {
        //   exitDate.value = formatTimestamp(response.data.content.exitDate);
        // }
        nextTick(() => {});
      } catch (err: any) {
        errorRecoList.value = err.message;
        dataRecoList.value = [];
      }
      console.log(totalList);
    };
    const onChangePage = () => {
      getRecoList();
    };
    //  进场过磅确认
    const handleIn = async () => {
      try {
        const response = await apiRequest<any>(
          "WeighbridgeRecordCreate",
          "/dde/cqrs",
          "POST",
          {
            data: {
              status: 0,
              approachWeight: mqqtDateCarW.value,
              approachDate: time2.value,
              plateNumber: valueLin.value,
              pic: pic.value,
            },
          }
        );
        dataRecoList.value = response.data.content || [];
        errorRecoList.value = null;
      } catch (err: any) {
        errorRecoList.value = err.message;
        dataRecoList.value = [];
      }
      getRecoList("", "");
    };
    //  出场过磅确认
    const handleOut = async () => {
      try {
        const response = await apiRequest<any>(
          "WeighbridgeRecordEdit",
          "/dde/cqrs",
          "POST",
          {
            data: {
              status: 1,
              exitWeight: mqqtDateCarW.value,
              exitDate: time2.value,
              plateNumber: valueLin.value,
              exitPic: pic.value,
            },
          }
        );
        dataRecoList.value = response.data.content || [];
        errorRecoList.value = null;
      } catch (err: any) {
        errorRecoList.value = err.message;
        dataRecoList.value = [];
      }
      getRecoList("", "");
    };

    onMounted(() => {
      getMake();
      getRecoList("", "");
      initQtt();
    });

    const columns = [
      { title: "序号", dataIndex: "id", key: "id" },
      { title: "车牌号", dataIndex: "plateNumber", key: "plateNumber" },
      { title: "进场类型", dataIndex: "type", key: "type" },
      {
        title: "预约时间",
        dataIndex: "reservationTime",
        key: "reservationTime",
      },
      { title: "备注说明", dataIndex: "remarks", key: "remarks" },
      {
        title: "操作",
        dataIndex: "operation",
        key: "operation",
        fixed: "right",
        width: 60,
      },
    ];

    const columnsRecoList = [
      { title: "序号", dataIndex: "id", key: "id" },
      { title: "过磅流水号", dataIndex: "serialNumber", key: "serialNumber" },
      { title: "车牌号", dataIndex: "plateNumber", key: "plateNumber" },
      { title: "状态", dataIndex: "status", key: "status" },
      { title: "进场过磅时间", dataIndex: "approachDate", key: "approachDate" },
      {
        title: "进场过磅重量（/吨）",
        dataIndex: "approachWeight",
        key: "approachWeight",
      },
      {
        title: "进场过磅图片",
        dataIndex: "pic",
        key: "pic",
      },
      { title: "出厂过磅时间", dataIndex: "exitDate", key: "exitDate" },
      {
        title: "出厂过磅重量（/吨）",
        dataIndex: "exitWeight",
        key: "exitWeight",
      },
      {
        title: "出厂过磅图片",
        dataIndex: "exitPic",
        key: "exitPic",
      },
      { title: "毛重（/吨）", dataIndex: "grossWeight", key: "grossWeight" },
      {
        title: "皮重（/吨）",
        dataIndex: "tareWeight",
        key: "tareWeight",
      },
      {
        title: "净重（/吨）",
        dataIndex: "netWeight",
        key: "netWeight",
      },
    ];

    // 查询按钮的处理方法
    const onSearch = () => {
      getRecoList(plateNumber.value, searchValue.value);
    };

    // 重置按钮的处理方法
    const onReset = () => {
      plateNumber.value = "";
      getRecoList("", ""); // 清空车牌号和时间范围
    };

    // 删除操作
    const onDelete = async (id: string) => {
      try {
        // 执行删除请求 (假设存在 delete API)
        const response = await apiRequest<any>(
          "VehicleReservationDelete",
          "/dde/cqrs",
          "POST",
          { id }
        );
        if (response.success) {
          message.success("删除成功");
          // 删除后刷新列表
          getMake();
        } else {
          message.error("删除失败");
        }
      } catch (err: any) {
        message.error("删除失败: " + err.message);
      }
    };

    // 初始mqtt     mqqtDateCar.payload.AlarmInfoPlate.result.PlateResult.type
    const mqqttClient = ref(null);
    let valueLin = ref<string>("");
    let time2 = ref<string>("");
    let mqqtDateCarW = ref<string>("");
    let pic = ref<string>("");
    const mqqtDateCar = ref({
      w: "-",
      timestamp: "-",
      payload: {
        AlarmInfoPlate: {
          result: {
            PlateResult: {
              type: "",
              license: "",
              full_image_content: "",
            },
          },
        },
      },
    });

    const initQtt = (call: () => void) => {
      mqqttClient.value = new UranusMqtt("ws://111.9.61.248:28083/mqtt", {
        clientId: new Date() + "wwwwwwwwwwwwwww",
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
        if (e.topic == "device/d0403532-2f93f866/message/up/ivs_result") {
          mqqtDateCar.value = e.payload;

          // const params = {
          //   base64Image:
          //     e.payload.payload.AlarmInfoPlate.result.PlateResult
          //       .full_image_content,
          //   objectName: "dfs",
          // };

          // // 调用图片转url
          // apiRequestAxios("http://192.168.1.59:19089/upload", "POST", params)
          //   .then((response) => {
          //     console.log("上传成功", response);
          //   })
          //   .catch((error) => {
          //     console.error("请求失败", error);
          //   });

          const decodedStr = ref<string | null>(null);
          // Base64 解码
          const decoded = atob(
            e.payload.payload.AlarmInfoPlate.result.PlateResult.license
          );
          console.log(decoded);
          // 处理中文字符乱码问题
          decodedStr.value = decodeURIComponent(escape(decoded));
          console.log("decodedStr", decodedStr.value);
          valueLin.value = decodedStr.value;
          console.log(valueLin);
          time2.value = formatTimestamp(e.payload.timestamp);
          // mqqtDateCarW.value=e.payload.w
          pic.value =
            e.payload.payload.AlarmInfoPlate.result.PlateResult.full_image_content;
        } else {
          mqqtDateCarW.value = e.payload.w;
        }
        nextTick(() => {});
        call(e);
      });

      if (mqqttClient.value) {
        mqqttClient.value.subscribeMqtt(topic.weighbridge);
        mqqttClient.value.subscribeMqtt(topic.ivs_result);
      }
    };

    // 格式化时间
    function formatTimestamp(timestamp: number): string {
      const date = new Date(timestamp * 1000); // 假设时间戳是秒级的，如果是毫秒级的则不需要乘以1000
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始，需要加1
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    return {
      plateNumber,
      valuePicker,
      dataSource: data,
      columns,
      error,
      dataSourceRecoList: dataRecoList,
      columnsRecoList,
      onSearch,
      onReset,
      onDelete,
      initQtt,
      videoUrl,
      videoUrlOut,
      mqqtDateCar,
      searchValue,
      options1,
      focus,
      handleChange,
      valueLin,
      time2,
      handleIn,
      handleOut,
      pic,
      mqqtDateCarW,
      approachDate,
      exitDate,
      current,
      onChangePage,
      totalList,
    };
  },
});
</script>

<style lang="less" scoped>
.outBridgeTime {
  display: flex;
  justify-content: center;
  align-items: center;

  .bridgeTime {
    width: 100%;
    height: 80px;
    background-color: rgb(192, 192, 188);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 32px;
    font-weight: 700;
  }
}
</style>
