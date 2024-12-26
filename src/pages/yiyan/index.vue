<template>
    <div>
      <h1>Base64 解码</h1>
      <input v-model="base64Str" placeholder="输入Base64编码的字符串" />
      <button @click="decodeBase64">解码</button>
      <div v-if="decodedStr">
        <h2>解码结果:</h2>
        <p>{{ decodedStr }}</p>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from 'vue';
  
  export default defineComponent({
    name: 'Base64Decoder',
    setup() {
      const base64Str = ref<string>('');
      const decodedStr = ref<string | null>(null);
  
      const decodeBase64 = () => {
        try {
          // Base64 解码
          const decoded = atob(base64Str.value);
          // 处理中文字符乱码问题
          decodedStr.value = decodeURIComponent(escape(decoded));
        } catch (error) {
          alert('Base64 解码失败: ' + error.message);
          decodedStr.value = null;
        }
      };
  
      return {
        base64Str,
        decodedStr,
        decodeBase64,
      };
    },
  });
  </script>
  
  <style scoped>
  input {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
  }
  
  button {
    padding: 10px 20px;
    cursor: pointer;
  }
  
  h2 {
    margin-top: 20px;
  }
  </style>