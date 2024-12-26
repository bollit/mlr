# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

#### 监控大屏 镜像构建

```bash

docker login -u cn-southwest-2@9NIGGELAQ7BMTJRZCQYB -p fcd99974bf8620f1be72f0c717aef85fa9ac8ec552a730f7a50bb49313a723b1 swr.cn-southwest-2.myhuaweicloud.com

docker build -t swr.cn-southwest-2.myhuaweicloud.com/tgsc/datav:v1.0.1 .
docker push swr.cn-southwest-2.myhuaweicloud.com/tgsc/datav:v1.0.1