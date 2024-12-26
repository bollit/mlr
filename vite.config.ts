import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
      ],
    }),
  ],
  resolve: {
    alias: [
      {
        find: "/@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
    extensions: [".vue", ".js", ".ts"],
  },
  base: "/",
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          hack: `true; @import (reference) "${path.resolve(
            "src/styles/index.less"
          )}";`,
        },
        javascriptEnabled: true,
      },
    },
  },
  build: {
    target: ["es2022"],
    sourcemap: process.env.NODE_ENV === 'production' ? false : true,
    minify: "esbuild",
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    assetsDir: 'public',
  },
  esbuild: {
    drop: ["console", "debugger"],
  },

  server: {
    cors: true,
    proxy: {
      '/api': {
        target: 'https://cscf-api.tgsc81.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.VITE_BASE_URL': JSON.stringify(process.env.VITE_BASE_URL),
  },

});
