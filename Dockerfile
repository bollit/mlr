# 基于Nginx的镜像，用于运行我们的应用
FROM registry.cn-hangzhou.aliyuncs.com/sfkj-com/alpine-nginx:latest

ADD dist/ /usr/html

EXPOSE 80 443
