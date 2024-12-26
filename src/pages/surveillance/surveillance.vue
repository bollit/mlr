<template>
  <div>
    <div style="background: #ececec; padding: 30px">
      <a-button style="margin: 0 0 16px 0" type="primary" @click="showDrawer"
        >添加设备</a-button
      >
      <a-card bordered="false" style="width: 100%">
        <a-empty v-if="total == 0" style="height: 736px" />
        <a-flex gap="middle" style="flex-wrap: wrap">
          <VideoPlayer
            v-for="item in dataSource"
            :key="item.id"
            :url="item.address"
            style="width: 30%; margin: 10px"
          />
        </a-flex>
        <a-flex gap="middle">
          <!-- 分页 -->
          <a-pagination
            v-model:current="current"
            @change="onChangePage"
            :total="total"
            show-less-items
          />
        </a-flex>
      </a-card>
    </div>
    <a-drawer
      title="新增设备"
      :width="720"
      :open="open"
      :body-style="{ paddingBottom: '80px' }"
      :footer-style="{ textAlign: 'right' }"
      @close="onClose"
    >
      <a-form :model="form" :rules="rules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="设备编码" name="deviceCode">
              <a-input
                v-model:value="form.deviceCode"
                placeholder="请输入设备编码"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="设备名称" name="deviceName">
              <a-input
                v-model:value="form.deviceName"
                placeholder="请输入设备名称"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="资源地址" name="address">
              <!-- <a-input
                v-model:value="form.address"
                style="width: 100%"
                addon-before="http://"
                addon-after=".com"
                placeholder="请输入资源地址"
              /> -->

              <a-input
                v-model:value="form.address"
                style="width: 100%"
                placeholder="请输入资源地址"
              >
                <!-- <template #addonBefore>
                  <a-select v-model:value="value3" style="width: 90px">
                    <a-select-option value="Http://">Http://</a-select-option>
                    <a-select-option value="Https://">Https://</a-select-option>
                  </a-select>
                </template>
                <template #addonAfter>
                  <a-select v-model:value="value4" style="width: 80px">
                    <a-select-option value=".com">.com</a-select-option>
                    <a-select-option value=".jp">.jp</a-select-option>
                    <a-select-option value=".cn">.cn</a-select-option>
                    <a-select-option value=".org">.org</a-select-option>
                  </a-select>
                </template> -->
              </a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="备注" name="remarks">
              <a-textarea
                v-model:value="form.remarks"
                :rows="4"
                placeholder="请输入备注"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <template #footer>
        <a-space>
          <a-button @click="onClose">取消</a-button>
          <a-button type="primary" @click="onSave">保存</a-button>
        </a-space>
      </template>
    </a-drawer>
  </div>
</template> 

<script lang="ts">
import { apiRequest } from "../../api/api";
import VideoPlayer from "/@/components/VideoPlayer.vue";
import { Button, Card, Form, message, Drawer } from "ant-design-vue";
import { defineComponent, onMounted, ref, reactive, computed } from "vue";
import { Dayjs } from "dayjs";
import { UserOutlined, PlusOutlined } from "@ant-design/icons-vue"; // 引入图标
import type { Rule } from "ant-design-vue/es/form";
const videoUrl = ref("ws://111.9.61.248:8072/car/101.live.flv");

type RangeValue = [Dayjs, Dayjs];

export default defineComponent({
  name: "App",
  components: {
    Button,
    Card,
    Form,
    UserOutlined,
    VideoPlayer,
    Drawer,
  },
  setup() {
    const data = ref<any>(null);
    const error = ref<string | null>(null);
    const dataRecoList = ref<any>(null);
    const errorRecoList = ref<string | null>(null);

    const plateNumber = ref<string>("");
    const valuePicker = ref<RangeValue>();

    const form = reactive({
      deviceCode: "",
      deviceName: "",
      remarks: "",
      address: "",
    });

    const rules: Record<string, Rule[]> = {
      deviceCode: [{ required: true, message: "请输入设备编码" }],
      deviceName: [{ required: true, message: "请输入设备名称" }],
      address: [{ required: true, message: "请输入资源地址" }],
      description: [{ required: true, message: "请输入备注" }],
    };

    const open = ref<boolean>(false);

    const showDrawer = () => {
      open.value = true;
    };

    const onClose = () => {
      open.value = false;
    };
    const value3 = ref<string>("Http://");
    const value4 = ref<string>(".com");
    // const formAddress = ref<string>("");

    // const address = computed(() => {
    //   return value3.value + formAddress.value + value4.value;
    // });
    // console.log(address);

    // 添加视频设备
    const onSave = async () => {
      try {
        const response = await apiRequest<any>(
          "VideoMonitoringCreate",
          "/dde/cqrs",
          "POST",
          {
            data: {
              ...form,
            },
          }
        );
        data.value = response.data.content || [];
        error.value = null;
        open.value = false;
        getMake();
      } catch (err: any) {
        error.value = err.message;
        data.value = [];
      }
    };
    const current = ref<string>("1");
    const total = ref<string>("1");
    const getMake = async () => {
      try {
        const response = await apiRequest<any>(
          "VideoMonitoringList",
          "/dde/cqrs",
          "POST",
          {
            page: current.value,
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

    const getRecoList = async () =>
      //   plateNumber: string,
      //   startTime: string,
      //   endTime: string
      {
        try {
          const response = await apiRequest<any>(
            "VideoMonitoringList",
            "/dde/cqrs",
            "POST",
            {
              page: 1,
              size: 10,
              // plateNumber,
              // startTime,
              // endTime,
            }
          );
          dataRecoList.value = response.data.content || [];
          errorRecoList.value = null;
        } catch (err: any) {
          errorRecoList.value = err.message;
          dataRecoList.value = [];
        }
      };

    onMounted(() => {
      getMake();
      getRecoList("", "0", "0");
    });

    // 查询按钮的处理方法
    const onSearch = () => {
      console.log("选择的时间范围:", valuePicker.value);
      if (valuePicker.value && valuePicker.value.length === 2) {
        const [startDate, endDate] = valuePicker.value;
        const startTime = startDate.format("YYYY-MM-DD");
        const endTime = endDate.format("YYYY-MM-DD");
        console.log("开始时间:", startTime, "结束时间:", endTime);
        getRecoList(plateNumber.value, startTime, endTime);
      } else {
        console.error("请选择完整的时间范围");
      }
    };

    return {
      plateNumber,
      valuePicker,
      dataSource: data,
      error,
      dataSourceRecoList: dataRecoList,
      onSearch,
      showDrawer,
      onClose,
      rules,
      form,
      open,
      onSave,
      current,
      onChangePage,
      total,
      value3,
      value4,
    };
  },
});
</script>

<style lang="scss" scoped>
</style>