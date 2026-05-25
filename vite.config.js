/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      // '@': resolve(__dirname, './src'),
      // apis: resolve(__dirname, "./src/apis"),
      assets: resolve(__dirname, "./src/assets"),
      // components: resolve(__dirname, "./src/components"),
      // layouts: resolve(__dirname, "./src/layouts"),
      // pages: resolve(__dirname, "./src/pages"),
      // utils: resolve(__dirname, "./src/utils"),
      // store: resolve(__dirname, "./src/store"),
    },
  },
  plugins: [react()],
  server: {
    // port: 3036
    port: 8592
  },
  preview: {
    port: 8592
  }
})

// export default defineConfig({
//   resolve: {
//     alias: {
//       // '@': resolve(__dirname, './src'),
//       apis: resolve(__dirname, "./src/apis"),
//       assets: resolve(__dirname, "./src/assets"),
//       components: resolve(__dirname, "./src/components"),
//       layouts: resolve(__dirname, "./src/layouts"),
//       pages: resolve(__dirname, "./src/pages"),
//       utils: resolve(__dirname, "./src/utils"),
//       store: resolve(__dirname, "./src/store"),
//     },
//   },
//   plugins: [react()],
//   server: {
//     port: 3036
//   },
//   preview: {
//     port: 9525
//   }
// })