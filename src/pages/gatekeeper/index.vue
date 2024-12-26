<template>
  <div>
    <div style="background: #ececec; padding: 30px">
      <a-flex>
        <a-card
          title="当前进/出厂车辆信息"
          bordered="false"
          style="width: 100%"
        >
          <a-flex gap="20">
            <a-list
              size="small"
              bordered
              :data-source="[mqqtDate]"
              style="width: 30%"
            >
              <a-list-item>进场时间：{{ time2 }}</a-list-item>
              <a-list-item
                >进场类型：{{
                  mqqtDate.payload.AlarmInfoPlate.result.PlateResult
                    .license_ext_type == 0
                    ? "未知车辆"
                    : mqqtDate.payload.AlarmInfoPlate.result.PlateResult
                        .license_ext_type == 1
                    ? "非运营"
                    : mqqtDate.payload.AlarmInfoPlate.result.PlateResult
                        .license_ext_type == 2
                    ? "运营"
                    : mqqtDate.payload.AlarmInfoPlate.result.PlateResult
                        .license_ext_type == 3
                    ? "政府车牌"
                    : "RM暂不支持"
                }}</a-list-item
              >
              <a-list-item>车牌号：{{ value2 }}</a-list-item>
              <!-- <a-list-item
                ><div>车头照片：</div>
                <img
                  style="width: 250px"
                  :src="
                    'data:image/png;base64,' +
                    mqqtDate.payload.AlarmInfoPlate.result.PlateResult
                      .full_image_content
                  "
                  alt=""
                />
              </a-list-item> -->
            </a-list>
            <a-list
              size="small"
              bordered
              :data-source="[mqqtDate]"
              style="width: 30%"
            >
              <a-list-item
                ><div>车头照片：</div>
                <a-image
                  style="width: 250px"
                  :src="
                    'data:image/png;base64,' +
                    mqqtDate.payload.AlarmInfoPlate.result.PlateResult
                      .full_image_content
                  "
                  alt=""
                />
              </a-list-item>
            </a-list>
            <a-card style="width: 40%">
              <a-flex vertical align="end">
                <a-flex>
                  <a-button
                    style="margin: 18px 0; height: 50px"
                    type="primary"
                    @click="handleOpen(2)"
                    >手动开闸自动落闸</a-button
                  >
                </a-flex>
                <a-flex>
                  <a-button
                    style="margin: 0 18px; height: 50px"
                    type="primary"
                    @click="handleOpen(1)"
                    >开闸</a-button
                  >
                  <a-button
                    type="primary"
                    style="height: 50px"
                    @click="handleOpen(0)"
                    >关闸</a-button
                  >
                </a-flex>
              </a-flex>
            </a-card>
          </a-flex>
        </a-card>
      </a-flex>
      <a-flex horizontal>
        <a-card title="实时摄像" bordered="false" style="width: 55%">
          <a-flex gap="middle">
            <VideoPlayer :url="videoUrl" style="width: 50%; height: 380px" />
            <VideoPlayer :url="videoUrlOut" style="width: 50%; height: 380px" />
          </a-flex>
        </a-card>

        <a-card title="进场预约管理" :bordered="false" style="width: 45%">
          <template #extra
            ><a-button type="primary" @click="getOrder"
              >新增预约车辆</a-button
            ></template
          >
          <a-modal v-model:open="open" title="新增预约车辆" @ok="handleOk">
            <a-form
              :model="formState"
              name="basic"
              :label-col="{ span: 8 }"
              :wrapper-col="{ span: 16 }"
              autocomplete="off"
              @finish="onFinish"
              @finishFailed="onFinishFailed"
            >
              <a-form-item
                label="车牌号"
                name="plateNumber"
                :rules="[{ required: true, message: '请输入车牌号!' }]"
              >
                <a-input
                  v-model:value="formState.plateNumber"
                  placeholder="请输入车牌号"
                />
              </a-form-item>

              <a-form-item
                label="进场时间"
                name="reservationTime"
                :rules="[{ required: true, message: '请输入进场时间!' }]"
              >
                <a-date-picker
                  v-model:value="formState.reservationTime"
                  show-time
                  placeholder="请输入进场时间"
                  @change="onChange"
                  @ok="onOk"
                />
              </a-form-item>

              <a-form-item label="原因说明" name="remarks">
                <a-textarea
                  v-model:value="formState.remarks"
                  placeholder="请输入原因说明"
                  show-count
                  :maxlength="100"
                />
              </a-form-item>
            </a-form>
            <template #footer>
              <a-button key="back" @click="handleOk">取消</a-button>
              <a-button
                key="submit"
                type="primary"
                :loading="loading"
                html-type="submit"
                @click="handleSubmit"
                >确认</a-button
              >
            </template>
          </a-modal>

          <!-- 显示获取到的表格数据 -->
          <a-table
            :dataSource="dataSource"
            :columns="columns"
            :pagination="false"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'operation'">
                <a-popconfirm
                  v-if="dataSource.length"
                  title="确认删除?"
                  @confirm="onDelete(record.id)"
                >
                  <a>删除</a>
                </a-popconfirm>
              </template>
              <template v-if="column.key === 'reservationTime'">
                {{ new Date(record.reservationTime).toLocaleString() }}
              </template>
              <template v-if="column.key == 'type'"
                >{{
                  record.type == 0
                    ? "预约车辆"
                    : record.type == 1
                    ? "已出厂"
                    : "其他"
                }}
              </template>
            </template>
          </a-table>
          <!-- 分页 -->
          <a-pagination
            v-model:current="current"
            @change="onChangePage"
            :total="total"
            show-less-items
            style="margin-top: 16px"
          />
        </a-card>
      </a-flex>
      <a-flex gap="middle" horizontal>
        <a-card title="入场记录" :bordered="false" style="width: 100%">
          <a-form layout="inline" style="margin: 0 0 16px 0">
            <a-form-item>
              <a-input
                placeholder="请输入车牌号检索"
                v-model:value="plateNumber"
              >
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-range-picker v-model:value="valuePicker" show-time />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="onSearch">查询</a-button>
              <!-- <a-button type="primary" @click.native="onSearch">查询</a-button> -->
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
              <template v-if="column.key == 'pic'">
                <a-image :width="150" :src="record.pic" />
              </template>
              <template v-if="column.key == 'approachTime'">{{
                new Date(record.approachTime).toLocaleString()
              }}</template>
              <template v-if="column.key == 'type'"
                >{{
                  record.type == 0
                    ? "待出厂"
                    : record.type == 1
                    ? "已出厂"
                    : "其他"
                }}
              </template>
            </template>
          </a-table>
          <!-- 分页 -->
          <a-pagination
            v-model:current="currentIn"
            @change="onChangePageIn"
            :total="totalIn"
            show-less-items
            style="margin-top: 16px"
          />
        </a-card>
      </a-flex>
    </div>
  </div>
</template>

<script lang="ts">
// import dayjs from "dayjs";
import { UranusMqtt } from "/@/mqttC";
import topic from "/@/config/index.ts";
import china from "/@/config/china.json";
// 车牌识别摄像头：ws://111.9.61.248:8072/car/101.live.flv
import { apiRequest } from "../../api/api";
// import VideoFlvPlayer from "../../components/VideoFlvPlayer.vue";
import VideoPlayer from "/@/components/VideoPlayer.vue";
import { Button, Card, Form, message, TableProps } from "ant-design-vue";
import {
  defineComponent,
  nextTick,
  onMounted,
  ref,
  reactive,
  computed,
} from "vue";
import { Dayjs } from "dayjs";
import { UserOutlined } from "@ant-design/icons-vue"; // 引入图标

const videoUrl = ref("ws://111.9.61.248:8072/car/101.live.flv");
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
    let black = ref<string>("0");

    // 门禁杆状态
    let pubValue = ref<string>("");

    let pubBody = ref<object>({});
    const handleOpen = (status: number) => {
      pubValue.value = status;
      let pub = pubValue.value;
      pubBody = {
        id: "NYGtiXpPy5ratyzU",
        sn: "d0403532-2f93f866",
        name: "gpio_out",
        version: "1.0",
        timestamp: new Date().getTime(),
        payload: {
          type: "gpio_out",
          body: {
            delay: 500,
            io: 0,
            value: pub,
          },
        },
      };

      initQtt();
    };

    const current = ref<string>("1");
    const total = ref<string>("1");
    const getMake = async () => {
      try {
        const response = await apiRequest<any>(
          "VehicleReservationTaskList",
          "/dde/cqrs",
          "POST",
          {
            page: current.value,
            size: 10,
          }
        );
        data.value = response.data.content || [];
        total.value = response.data.total;
        error.value = null;
      } catch (err: any) {
        error.value = err.message;
        data.value = [];
      }
    };
    const onChangePage = () => {
      getMake();
    };
    // 新增车辆预约
    const open = ref<boolean>(false);

    interface FormState {
      plateNumber: string;
      reservationTime: string;
      remarks: string;
    }

    const formState = reactive<FormState>({
      plateNumber: "",
      reservationTime: "",
      remarks: "",
    });
    const onFinish = (values: any) => {
      console.log("Success:", values);
    };

    const onFinishFailed = (errorInfo: any) => {
      console.log("Failed:", errorInfo);
    };

    const getOrder = async () => {
      open.value = true;
    };

    const handleSubmit = async (e: any) => {
      const { plateNumber, reservationTime, remarks } = formState;
      try {
        const response = await apiRequest<any>(
          "VehicleReservationCreate",
          "/dde/cqrs",
          "POST",
          {
            data: {
              type: "0",
              plateNumber,
              reservationTime,
              remarks,
            },
          }
        );
        if (response.data) {
          data.value = response.data.content || [];
          error.value = null;
          message.success("预约成功！");
          open.value = false;
          // 添加白名单
          whiteList.value = true;
          initQtt();
        } else {
          message.error("预约失败！");
        }
        getMake();
      } catch (err: any) {
        error.value = err.message;
        data.value = [];
        message.error(`请求失败: ${err.message}`);
      }
    };

    const whiteList = ref<boolean>(false);
    const handleOk = (e: MouseEvent) => {
      open.value = false;
    };
    const currentIn = ref<string>("1");
    const totalIn = ref<string>("1");
    // 获取入场记录数据并传入 startTime 和 endTime
    const getRecodList = async (
      plateNumber: string,
      startTime: string,
      endTime: string
    ) => {
      try {
        const response = await apiRequest<any>(
          "FactoryEntryRecoList",
          "/dde/cqrs",
          "POST",
          {
            page: currentIn.value,
            size: 10,
            plateNumber,
            startTime,
            endTime,
          }
        );
        dataRecoList.value = response.data.content || [];
        totalIn.value = response.data.total;
        errorRecoList.value = null;
      } catch (err: any) {
        errorRecoList.value = err.message;
        dataRecoList.value = [];
      }
    };
    const onChangePageIn = () => {
      getRecodList("", "0", "0");
    };
    onMounted(() => {
      getMake();
      getRecodList("", "0", "0");

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
      { title: "车牌号", dataIndex: "plateNumber", key: "plateNumber" },
      { title: "进场类型", dataIndex: "type", key: "type" },
      {
        title: "进场时间",
        dataIndex: "approachTime",
        key: "approachTime",
      },
      {
        title: "进场图片",
        dataIndex: "pic",
        key: "pic",
      },
      {
        title: "出场时间",
        dataIndex: "approachTime",
        key: "approachTime",
      },
      {
        title: "出场图片",
        dataIndex: "pic",
        key: "pic",
      },
    ];

    // 查询按钮的处理方法
    const onSearch = () => {
      console.log("选择的时间范围:", valuePicker.value);
      if (valuePicker.value && valuePicker.value.length === 2) {
        const [startDate, endDate] = valuePicker.value;
        const startTime = startDate.format("YYYY-MM-DD");
        const endTime = endDate.format("YYYY-MM-DD");
        console.log("开始时间:", startTime, "结束时间:", endTime);
        getRecodList(plateNumber.value, startTime, endTime);
      } else {
        // console.error("请选择完整的时间范围");
        getRecodList(plateNumber.value, "0", "0"); // 清空车牌号和时间范围
      }
    };

    // 重置按钮的处理方法
    const onReset = () => {
      plateNumber.value = "";
      getRecodList("", "0", "0"); // 清空车牌号和时间范围
    };

    // 删除操作
    const onDelete = async (id: string) => {
      try {
        const response = await apiRequest<any>(
          "VehicleReservationDelete",
          "dde/cqrs",
          "POST",
          { id }
        );
        if (response.success) {
          message.success("删除成功");
        }
        getMake();
        //移除名单
        black.value = "1";
        initQtt();
      } catch (err: any) {
        message.error("删除失败: " + err.message);
      }
    };

    // 初始mqtt
    const mqqttClient = ref(null);
    let value2 = ref<string>("");
    let time2 = ref<string>("");
    let mqqtDate = ref({
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
        clientId: new Date().getTime(),
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
      mqqttClient.value.on(
        "onMessageMqtt",
        (e: {
          payload:
            | {
                timestamp: string;
                payload: {
                  AlarmInfoPlate: {
                    result: {
                      PlateResult: {
                        type: string;
                        license: string;
                        full_image_content: string;
                      };
                    };
                  };
                };
              }
            | {
                timestamp: string;
                payload: {
                  AlarmInfoPlate: {
                    result: {
                      PlateResult: {
                        type: string;
                        license: string;
                        full_image_content: string;
                      };
                    };
                  };
                };
              };
        }) => {
          console.log("客户端消息", e);
          mqqtDate.value = e.payload;
          const decodedStr = ref<string | null>(null);
          // Base64 解码
          const decoded = atob(
            e.payload.payload.AlarmInfoPlate.result.PlateResult.license
          );
          console.log(decoded);
          // 处理中文字符乱码问题
          decodedStr.value = decodeURIComponent(escape(decoded));
          console.log("decodedStr", decodedStr.value);
          value2.value = decodedStr.value;
          console.log(value2);
          time2.value = formatTimestamp(e.payload.timestamp);
          nextTick(() => {});
          call(e);
        }
      );

      if (mqqttClient.value && whiteList.value == false) {
        if (black.value == "1") {
          let time = new Date();
          time.setHours(23);
          time.setMinutes(59);
          time.setSeconds(59);
          let overdue = formatDate(time);

          console.log("overdue", overdue);

          let blackBody = ref<object>({});
          blackBody = {
            id: "Zr7O1PzBPD57Q4ku",
            sn: "d0403532-2f93f866",
            name: "white_list_operator",
            version: "1.0",
            payload: {
              type: "white_list_operator",
              body: {
                operator_type: "delete",
                plate: formState.plateNumber,
              },
            },
            timestamp: new Date().getTime(),
          };

          const blackBodyJson = JSON.stringify(blackBody);
          console.log("whiteBodyJson", blackBodyJson);

          mqqttClient.value.publishMqtt(topic.white_list, blackBodyJson);
          black.value = "0";
        } else {
          const pubBodyJson = JSON.stringify(pubBody);

          console.log("pubBodyJson", pubBodyJson);

          mqqttClient.value.subscribeMqtt(topic.ivs_result);
          mqqttClient.value.publishMqtt(topic.gpio_out, pubBodyJson);
        }
      } else if (whiteList.value == true) {
        console.log("overdgggggggggggggdue");

        let time = new Date();
        time.setHours(23);
        time.setMinutes(59);
        time.setSeconds(59);
        let overdue = formatDate(time);

        console.log("overdue", overdue);

        let whiteBody = ref<object>({});
        whiteBody = {
          id: "Zr7O1PzBPD57Q4ku",
          sn: "d0403532-2f93f866",
          name: "white_list_operator",
          version: "1.0",
          payload: {
            type: "white_list_operator",
            body: {
              operator_type: "update_or_add",
              dldb_rec: {
                create_time: formatDate(new Date()),
                overdue_time: overdue,
                enable: 1,
                plate: formState.plateNumber,
                time_seg_enable: 0,
                seg_time_start: "00:00:00",
                seg_time_end: "00:00:00",
                need_alarm: 0,
                vehicle_code: "3254ASFDSFSD",
                vehicle_comment: "HELOO woradf",
                customer_id: 144413212,
              },
            },
          },
          timestamp: new Date().getTime(),
        };

        const whiteBodyJson = JSON.stringify(whiteBody);
        console.log("whiteBodyJson", whiteBodyJson);

        mqqttClient.value.publishMqtt(topic.white_list, whiteBodyJson);
        whiteList.value = false;
      }
    };
    // 格式化时间
    function formatTimestamp(timestamp: number): string {
      const date = new Date(timestamp * 1000);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始，需要加1
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    function formatDate(dateString) {
      const date = new Date(dateString);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始，需要+1
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
      mqqtDate,
      handleOpen,
      value2,
      time2,
      getOrder,
      handleOk,
      open,
      handleSubmit,
      formState,
      onFinishFailed,
      onFinish,
      formatTimestamp,
      onChangePage,
      total,
      current,
      onChangePageIn,
      totalIn,
      currentIn,
    };
  },
});
</script>

<style lang="scss" scoped>
</style>
