import { defineConfig } from "vite"
import { fileURLToPath, URL } from "url"
import postcss from "./postcss.config.js"
import react from "@vitejs/plugin-react"
import dns from "dns"
import { visualizer } from "rollup-plugin-visualizer"

import fs from 'fs';
import path from 'path';

// 指定你的证书和私钥文件的路径
const certPath = path.resolve(__dirname, process.env.NODE_ENV === "development"
  ? '../certs/anyzearch.local.crt' : '/etc/ssl/certs/anyzearch.local.crt');
const keyPath = path.resolve(__dirname, process.env.NODE_ENV === "development"
  ? '../certs/anyzearch.local.key' : '/etc/ssl/certs/anyzearch.local.key');

// SSH KeyPath for Windows
// const certPath = path.resolve(__dirname,  '../certs/win10.local.crt');
// const keyPath = path.resolve(__dirname, '../certs/win10.local.key');

// SSH KeyPath for Linux
// const certPath = path.resolve(__dirname,   '/etc/ssl/certs/anyzearch.local.crt');
// const keyPath = path.resolve(__dirname, '/etc/ssl/certs/anyzearch.local.key');


    
dns.setDefaultResultOrder("verbatim")

//@SSH
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    host: "localhost"
    , https: {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath)
    }
  },
  define: {
    "process.env": process.env
  },
  css: {
    postcss
  },
  plugins: [
    react(),
    visualizer({
      template: "treemap", // or sunburst
      open: false,
      gzipSize: true, // @DEBUG, set to false for debug
      brotliSize: true, // @DEBUG, set to false for debug
      filename: "bundleinspector.html" // will be saved in project's root
    })
  ],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url))
      },
      {
        process: "process/browser",
        stream: "stream-browserify",
        zlib: "browserify-zlib",
        util: "util",
        find: /^~.+/,
        replacement: (val) => {
          return val.replace(/^~/, "")
        }
      }
    ]
  },
  build: {
    sourcemap: false, // @DEBUG, set to true for debug frontend minification
    minify: true, // @DEBUG, set to false for debug Avoids minification
    cssCodeSplit: true, // @DEBUG, set to false for debug Avoids splitting CSS into multiple files
    rollupOptions: {
      output: {
        // These settings ensure the primary JS and CSS file references are always index.{js,css}
        // so we can SSR the index.html as text response from server/index.js without breaking references each build.
        entryFileNames: 'index.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') return `index.css`;
          return assetInfo.name;
        },
      },
      external: [
        // Reduces transformation time by 50% and we don't even use this variant, so we can ignore.
        /@phosphor-icons\/react\/dist\/ssr/
      ]
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis"
      },
      plugins: []
    }
  }
})
