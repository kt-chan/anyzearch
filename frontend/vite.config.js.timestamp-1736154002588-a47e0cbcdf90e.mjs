// vite.config.js
import { defineConfig } from "file:///D:/GitHub/anyzearch/build/frontend/node_modules/vite/dist/node/index.js";
import { fileURLToPath, URL } from "url";

// postcss.config.js
import tailwind from "file:///D:/GitHub/anyzearch/build/frontend/node_modules/tailwindcss/lib/index.js";
import autoprefixer from "file:///D:/GitHub/anyzearch/build/frontend/node_modules/autoprefixer/lib/autoprefixer.js";

// tailwind.config.js
var tailwind_config_default = {
  darkMode: "false",
  content: {
    relative: true,
    files: [
      "./src/components/**/*.{js,jsx}",
      "./src/hooks/**/*.js",
      "./src/models/**/*.js",
      "./src/pages/**/*.{js,jsx}",
      "./src/utils/**/*.js",
      "./src/*.jsx",
      "./index.html",
      "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}"
    ]
  },
  theme: {
    extend: {
      rotate: {
        "270": "270deg",
        "360": "360deg"
      },
      colors: {
        "black-900": "#141414",
        accent: "#3D4147",
        "sidebar-button": "#31353A",
        sidebar: "#25272C",
        "historical-msg-system": "rgba(255, 255, 255, 0.05);",
        "historical-msg-user": "#2C2F35",
        outline: "#4E5153",
        "primary-button": "#46C8FF",
        secondary: "#2C2F36",
        "dark-input": "#18181B",
        "mobile-onboarding": "#2C2F35",
        "dark-highlight": "#1C1E21",
        "dark-text": "#222628",
        description: "#D2D5DB",
        "x-button": "#9CA3AF",
        darker: "#F4F4F4"
      },
      backgroundImage: {
        "preference-gradient": "linear-gradient(180deg, #5A5C63 0%, rgba(90, 92, 99, 0.28) 100%);",
        "chat-msg-user-gradient": "linear-gradient(180deg, #3D4147 0%, #2C2F35 100%);",
        "selected-preference-gradient": "linear-gradient(180deg, #313236 0%, rgba(63.40, 64.90, 70.13, 0) 100%);",
        "main-gradient": "linear-gradient(180deg, #3D4147 0%, #2C2F35 100%)",
        "modal-gradient": "linear-gradient(180deg, #3D4147 0%, #2C2F35 100%)",
        "sidebar-gradient": "linear-gradient(90deg, #5B616A 0%, #3F434B 100%)",
        "login-gradient": "linear-gradient(180deg, #3D4147 0%, #2C2F35 100%)",
        "menu-item-gradient": "linear-gradient(90deg, #3D4147 0%, #2C2F35 100%)",
        "menu-item-selected-gradient": "linear-gradient(90deg, #5B616A 0%, #3F434B 100%)",
        "workspace-item-gradient": "linear-gradient(90deg, #3D4147 0%, #2C2F35 100%)",
        "workspace-item-selected-gradient": "linear-gradient(90deg, #5B616A 0%, #3F434B 100%)",
        "switch-selected": "linear-gradient(146deg, #5B616A 0%, #3F434B 100%)"
      },
      fontFamily: {
        sans: [
          "plus-jakarta-sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          '"Noto Sans"',
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"'
        ]
      },
      animation: {
        sweep: "sweep 0.5s ease-in-out"
      },
      keyframes: {
        sweep: {
          "0%": { transform: "scaleX(0)", transformOrigin: "bottom left" },
          "100%": { transform: "scaleX(1)", transformOrigin: "bottom left" }
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 }
        },
        fadeOut: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 }
        }
      }
    }
  },
  // Required for rechart styles to show since they can be rendered dynamically and will be tree-shaken if not safe-listed.
  safelist: [
    {
      pattern: /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"]
    },
    {
      pattern: /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"]
    },
    {
      pattern: /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"]
    },
    {
      pattern: /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/
    },
    {
      pattern: /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/
    },
    {
      pattern: /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/
    }
  ],
  plugins: []
};

// postcss.config.js
var postcss_config_default = {
  plugins: [tailwind(tailwind_config_default), autoprefixer]
};

// vite.config.js
import react from "file:///D:/GitHub/anyzearch/build/frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import dns from "dns";
import { visualizer } from "file:///D:/GitHub/anyzearch/build/frontend/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import fs from "fs";
import path from "path";
var __vite_injected_original_dirname = "D:\\GitHub\\anyzearch\\build\\frontend";
var __vite_injected_original_import_meta_url = "file:///D:/GitHub/anyzearch/build/frontend/vite.config.js";
var certPath = path.resolve(__vite_injected_original_dirname, process.env.NODE_ENV === "development" ? "../certs/win10.local.crt" : "/etc/ssl/certs/anyzearch.local.crt");
var keyPath = path.resolve(__vite_injected_original_dirname, process.env.NODE_ENV === "development" ? "../certs/win10.local.key" : "/etc/ssl/certs/anyzearch.local.key");
dns.setDefaultResultOrder("verbatim");
var vite_config_default = defineConfig({
  server: {
    port: 3e3,
    host: "localhost",
    https: {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath)
    }
  },
  define: {
    "process.env": process.env
  },
  css: {
    postcss: postcss_config_default
  },
  plugins: [
    react(),
    visualizer({
      template: "treemap",
      // or sunburst
      open: false,
      gzipSize: true,
      // @DEBUG, set to false for debug
      brotliSize: true,
      // @DEBUG, set to false for debug
      filename: "bundleinspector.html"
      // will be saved in project's root
    })
  ],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
      },
      {
        process: "process/browser",
        stream: "stream-browserify",
        zlib: "browserify-zlib",
        util: "util",
        find: /^~.+/,
        replacement: (val) => {
          return val.replace(/^~/, "");
        }
      }
    ]
  },
  build: {
    sourcemap: false,
    // @DEBUG, set to true for debug frontend minification
    minify: true,
    // @DEBUG, set to false for debug Avoids minification
    cssCodeSplit: true,
    // @DEBUG, set to false for debug Avoids splitting CSS into multiple files
    rollupOptions: {
      output: {
        // These settings ensure the primary JS and CSS file references are always index.{js,css}
        // so we can SSR the index.html as text response from server/index.js without breaking references each build.
        entryFileNames: "index.js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "index.css")
            return `index.css`;
          return assetInfo.name;
        }
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
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAicG9zdGNzcy5jb25maWcuanMiLCAidGFpbHdpbmQuY29uZmlnLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcR2l0SHViXFxcXGFueXplYXJjaFxcXFxidWlsZFxcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcR2l0SHViXFxcXGFueXplYXJjaFxcXFxidWlsZFxcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovR2l0SHViL2FueXplYXJjaC9idWlsZC9mcm9udGVuZC92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCJcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGgsIFVSTCB9IGZyb20gXCJ1cmxcIlxuaW1wb3J0IHBvc3Rjc3MgZnJvbSBcIi4vcG9zdGNzcy5jb25maWcuanNcIlxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiXG5pbXBvcnQgZG5zIGZyb20gXCJkbnNcIlxuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gXCJyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXJcIlxuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbi8vIFx1NjMwN1x1NUI5QVx1NEY2MFx1NzY4NFx1OEJDMVx1NEU2Nlx1NTQ4Q1x1NzlDMVx1OTRBNVx1NjU4N1x1NEVGNlx1NzY4NFx1OERFRlx1NUY4NFxuY29uc3QgY2VydFBhdGggPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJkZXZlbG9wbWVudFwiXG4gID8gJy4uL2NlcnRzL3dpbjEwLmxvY2FsLmNydCcgOiAnL2V0Yy9zc2wvY2VydHMvYW55emVhcmNoLmxvY2FsLmNydCcpO1xuY29uc3Qga2V5UGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcImRldmVsb3BtZW50XCJcbiAgPyAnLi4vY2VydHMvd2luMTAubG9jYWwua2V5JyA6ICcvZXRjL3NzbC9jZXJ0cy9hbnl6ZWFyY2gubG9jYWwua2V5Jyk7XG5cbi8vIFNTSCBLZXlQYXRoIGZvciBXaW5kb3dzXG4vLyBjb25zdCBjZXJ0UGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICAnLi4vY2VydHMvd2luMTAubG9jYWwuY3J0Jyk7XG4vLyBjb25zdCBrZXlQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2NlcnRzL3dpbjEwLmxvY2FsLmtleScpO1xuXG4vLyBTU0ggS2V5UGF0aCBmb3IgTGludXhcbi8vIGNvbnN0IGNlcnRQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgICAnL2V0Yy9zc2wvY2VydHMvYW55emVhcmNoLmxvY2FsLmNydCcpO1xuLy8gY29uc3Qga2V5UGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcvZXRjL3NzbC9jZXJ0cy9hbnl6ZWFyY2gubG9jYWwua2V5Jyk7XG5cblxuICAgIFxuZG5zLnNldERlZmF1bHRSZXN1bHRPcmRlcihcInZlcmJhdGltXCIpXG5cbi8vQFNTSFxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgaG9zdDogXCJsb2NhbGhvc3RcIlxuICAgICwgaHR0cHM6IHtcbiAgICAgIGNlcnQ6IGZzLnJlYWRGaWxlU3luYyhjZXJ0UGF0aCksXG4gICAgICBrZXk6IGZzLnJlYWRGaWxlU3luYyhrZXlQYXRoKVxuICAgIH1cbiAgfSxcbiAgZGVmaW5lOiB7XG4gICAgXCJwcm9jZXNzLmVudlwiOiBwcm9jZXNzLmVudlxuICB9LFxuICBjc3M6IHtcbiAgICBwb3N0Y3NzXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHZpc3VhbGl6ZXIoe1xuICAgICAgdGVtcGxhdGU6IFwidHJlZW1hcFwiLCAvLyBvciBzdW5idXJzdFxuICAgICAgb3BlbjogZmFsc2UsXG4gICAgICBnemlwU2l6ZTogdHJ1ZSwgLy8gQERFQlVHLCBzZXQgdG8gZmFsc2UgZm9yIGRlYnVnXG4gICAgICBicm90bGlTaXplOiB0cnVlLCAvLyBAREVCVUcsIHNldCB0byBmYWxzZSBmb3IgZGVidWdcbiAgICAgIGZpbGVuYW1lOiBcImJ1bmRsZWluc3BlY3Rvci5odG1sXCIgLy8gd2lsbCBiZSBzYXZlZCBpbiBwcm9qZWN0J3Mgcm9vdFxuICAgIH0pXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczogW1xuICAgICAge1xuICAgICAgICBmaW5kOiBcIkBcIixcbiAgICAgICAgcmVwbGFjZW1lbnQ6IGZpbGVVUkxUb1BhdGgobmV3IFVSTChcIi4vc3JjXCIsIGltcG9ydC5tZXRhLnVybCkpXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBwcm9jZXNzOiBcInByb2Nlc3MvYnJvd3NlclwiLFxuICAgICAgICBzdHJlYW06IFwic3RyZWFtLWJyb3dzZXJpZnlcIixcbiAgICAgICAgemxpYjogXCJicm93c2VyaWZ5LXpsaWJcIixcbiAgICAgICAgdXRpbDogXCJ1dGlsXCIsXG4gICAgICAgIGZpbmQ6IC9efi4rLyxcbiAgICAgICAgcmVwbGFjZW1lbnQ6ICh2YWwpID0+IHtcbiAgICAgICAgICByZXR1cm4gdmFsLnJlcGxhY2UoL15+LywgXCJcIilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF1cbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBzb3VyY2VtYXA6IGZhbHNlLCAvLyBAREVCVUcsIHNldCB0byB0cnVlIGZvciBkZWJ1ZyBmcm9udGVuZCBtaW5pZmljYXRpb25cbiAgICBtaW5pZnk6IHRydWUsIC8vIEBERUJVRywgc2V0IHRvIGZhbHNlIGZvciBkZWJ1ZyBBdm9pZHMgbWluaWZpY2F0aW9uXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLCAvLyBAREVCVUcsIHNldCB0byBmYWxzZSBmb3IgZGVidWcgQXZvaWRzIHNwbGl0dGluZyBDU1MgaW50byBtdWx0aXBsZSBmaWxlc1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICAvLyBUaGVzZSBzZXR0aW5ncyBlbnN1cmUgdGhlIHByaW1hcnkgSlMgYW5kIENTUyBmaWxlIHJlZmVyZW5jZXMgYXJlIGFsd2F5cyBpbmRleC57anMsY3NzfVxuICAgICAgICAvLyBzbyB3ZSBjYW4gU1NSIHRoZSBpbmRleC5odG1sIGFzIHRleHQgcmVzcG9uc2UgZnJvbSBzZXJ2ZXIvaW5kZXguanMgd2l0aG91dCBicmVha2luZyByZWZlcmVuY2VzIGVhY2ggYnVpbGQuXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnaW5kZXguanMnLFxuICAgICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbykgPT4ge1xuICAgICAgICAgIGlmIChhc3NldEluZm8ubmFtZSA9PT0gJ2luZGV4LmNzcycpIHJldHVybiBgaW5kZXguY3NzYDtcbiAgICAgICAgICByZXR1cm4gYXNzZXRJbmZvLm5hbWU7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgZXh0ZXJuYWw6IFtcbiAgICAgICAgLy8gUmVkdWNlcyB0cmFuc2Zvcm1hdGlvbiB0aW1lIGJ5IDUwJSBhbmQgd2UgZG9uJ3QgZXZlbiB1c2UgdGhpcyB2YXJpYW50LCBzbyB3ZSBjYW4gaWdub3JlLlxuICAgICAgICAvQHBob3NwaG9yLWljb25zXFwvcmVhY3RcXC9kaXN0XFwvc3NyL1xuICAgICAgXVxuICAgIH0sXG4gICAgY29tbW9uanNPcHRpb25zOiB7XG4gICAgICB0cmFuc2Zvcm1NaXhlZEVzTW9kdWxlczogdHJ1ZVxuICAgIH1cbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgIGRlZmluZToge1xuICAgICAgICBnbG9iYWw6IFwiZ2xvYmFsVGhpc1wiXG4gICAgICB9LFxuICAgICAgcGx1Z2luczogW11cbiAgICB9XG4gIH1cbn0pXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXEdpdEh1YlxcXFxhbnl6ZWFyY2hcXFxcYnVpbGRcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEdpdEh1YlxcXFxhbnl6ZWFyY2hcXFxcYnVpbGRcXFxcZnJvbnRlbmRcXFxccG9zdGNzcy5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdEh1Yi9hbnl6ZWFyY2gvYnVpbGQvZnJvbnRlbmQvcG9zdGNzcy5jb25maWcuanNcIjtpbXBvcnQgdGFpbHdpbmQgZnJvbSAndGFpbHdpbmRjc3MnXG5pbXBvcnQgYXV0b3ByZWZpeGVyIGZyb20gJ2F1dG9wcmVmaXhlcidcbmltcG9ydCB0YWlsd2luZENvbmZpZyBmcm9tICcuL3RhaWx3aW5kLmNvbmZpZy5qcydcblxuZXhwb3J0IGRlZmF1bHQge1xuICBwbHVnaW5zOiBbdGFpbHdpbmQodGFpbHdpbmRDb25maWcpLCBhdXRvcHJlZml4ZXJdLFxufSIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcR2l0SHViXFxcXGFueXplYXJjaFxcXFxidWlsZFxcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcR2l0SHViXFxcXGFueXplYXJjaFxcXFxidWlsZFxcXFxmcm9udGVuZFxcXFx0YWlsd2luZC5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0dpdEh1Yi9hbnl6ZWFyY2gvYnVpbGQvZnJvbnRlbmQvdGFpbHdpbmQuY29uZmlnLmpzXCI7LyoqIEB0eXBlIHtpbXBvcnQoJ3RhaWx3aW5kY3NzJykuQ29uZmlnfSAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICBkYXJrTW9kZTogXCJmYWxzZVwiLFxuICBjb250ZW50OiB7XG4gICAgcmVsYXRpdmU6IHRydWUsXG4gICAgZmlsZXM6IFtcbiAgICAgIFwiLi9zcmMvY29tcG9uZW50cy8qKi8qLntqcyxqc3h9XCIsXG4gICAgICBcIi4vc3JjL2hvb2tzLyoqLyouanNcIixcbiAgICAgIFwiLi9zcmMvbW9kZWxzLyoqLyouanNcIixcbiAgICAgIFwiLi9zcmMvcGFnZXMvKiovKi57anMsanN4fVwiLFxuICAgICAgXCIuL3NyYy91dGlscy8qKi8qLmpzXCIsXG4gICAgICBcIi4vc3JjLyouanN4XCIsXG4gICAgICBcIi4vaW5kZXguaHRtbFwiLFxuICAgICAgXCIuL25vZGVfbW9kdWxlcy9AdHJlbW9yLyoqLyoue2pzLHRzLGpzeCx0c3h9XCJcbiAgICBdXG4gIH0sXG4gIHRoZW1lOiB7XG4gICAgZXh0ZW5kOiB7XG4gICAgICByb3RhdGU6IHtcbiAgICAgICAgXCIyNzBcIjogXCIyNzBkZWdcIixcbiAgICAgICAgXCIzNjBcIjogXCIzNjBkZWdcIlxuICAgICAgfSxcbiAgICAgIGNvbG9yczoge1xuICAgICAgICBcImJsYWNrLTkwMFwiOiBcIiMxNDE0MTRcIixcbiAgICAgICAgYWNjZW50OiBcIiMzRDQxNDdcIixcbiAgICAgICAgXCJzaWRlYmFyLWJ1dHRvblwiOiBcIiMzMTM1M0FcIixcbiAgICAgICAgc2lkZWJhcjogXCIjMjUyNzJDXCIsXG4gICAgICAgIFwiaGlzdG9yaWNhbC1tc2ctc3lzdGVtXCI6IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KTtcIixcbiAgICAgICAgXCJoaXN0b3JpY2FsLW1zZy11c2VyXCI6IFwiIzJDMkYzNVwiLFxuICAgICAgICBvdXRsaW5lOiBcIiM0RTUxNTNcIixcbiAgICAgICAgXCJwcmltYXJ5LWJ1dHRvblwiOiBcIiM0NkM4RkZcIixcbiAgICAgICAgc2Vjb25kYXJ5OiBcIiMyQzJGMzZcIixcbiAgICAgICAgXCJkYXJrLWlucHV0XCI6IFwiIzE4MTgxQlwiLFxuICAgICAgICBcIm1vYmlsZS1vbmJvYXJkaW5nXCI6IFwiIzJDMkYzNVwiLFxuICAgICAgICBcImRhcmstaGlnaGxpZ2h0XCI6IFwiIzFDMUUyMVwiLFxuICAgICAgICBcImRhcmstdGV4dFwiOiBcIiMyMjI2MjhcIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiI0QyRDVEQlwiLFxuICAgICAgICBcIngtYnV0dG9uXCI6IFwiIzlDQTNBRlwiLFxuICAgICAgICBkYXJrZXI6IFwiI0Y0RjRGNFwiXG4gICAgICB9LFxuICAgICAgYmFja2dyb3VuZEltYWdlOiB7XG4gICAgICAgIFwicHJlZmVyZW5jZS1ncmFkaWVudFwiOlxuICAgICAgICAgIFwibGluZWFyLWdyYWRpZW50KDE4MGRlZywgIzVBNUM2MyAwJSwgcmdiYSg5MCwgOTIsIDk5LCAwLjI4KSAxMDAlKTtcIixcbiAgICAgICAgXCJjaGF0LW1zZy11c2VyLWdyYWRpZW50XCI6XG4gICAgICAgICAgXCJsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjM0Q0MTQ3IDAlLCAjMkMyRjM1IDEwMCUpO1wiLFxuICAgICAgICBcInNlbGVjdGVkLXByZWZlcmVuY2UtZ3JhZGllbnRcIjpcbiAgICAgICAgICBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICMzMTMyMzYgMCUsIHJnYmEoNjMuNDAsIDY0LjkwLCA3MC4xMywgMCkgMTAwJSk7XCIsXG4gICAgICAgIFwibWFpbi1ncmFkaWVudFwiOiBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICMzRDQxNDcgMCUsICMyQzJGMzUgMTAwJSlcIixcbiAgICAgICAgXCJtb2RhbC1ncmFkaWVudFwiOiBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICMzRDQxNDcgMCUsICMyQzJGMzUgMTAwJSlcIixcbiAgICAgICAgXCJzaWRlYmFyLWdyYWRpZW50XCI6IFwibGluZWFyLWdyYWRpZW50KDkwZGVnLCAjNUI2MTZBIDAlLCAjM0Y0MzRCIDEwMCUpXCIsXG4gICAgICAgIFwibG9naW4tZ3JhZGllbnRcIjogXCJsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjM0Q0MTQ3IDAlLCAjMkMyRjM1IDEwMCUpXCIsXG4gICAgICAgIFwibWVudS1pdGVtLWdyYWRpZW50XCI6XG4gICAgICAgICAgXCJsaW5lYXItZ3JhZGllbnQoOTBkZWcsICMzRDQxNDcgMCUsICMyQzJGMzUgMTAwJSlcIixcbiAgICAgICAgXCJtZW51LWl0ZW0tc2VsZWN0ZWQtZ3JhZGllbnRcIjpcbiAgICAgICAgICBcImxpbmVhci1ncmFkaWVudCg5MGRlZywgIzVCNjE2QSAwJSwgIzNGNDM0QiAxMDAlKVwiLFxuICAgICAgICBcIndvcmtzcGFjZS1pdGVtLWdyYWRpZW50XCI6XG4gICAgICAgICAgXCJsaW5lYXItZ3JhZGllbnQoOTBkZWcsICMzRDQxNDcgMCUsICMyQzJGMzUgMTAwJSlcIixcbiAgICAgICAgXCJ3b3Jrc3BhY2UtaXRlbS1zZWxlY3RlZC1ncmFkaWVudFwiOlxuICAgICAgICAgIFwibGluZWFyLWdyYWRpZW50KDkwZGVnLCAjNUI2MTZBIDAlLCAjM0Y0MzRCIDEwMCUpXCIsXG4gICAgICAgIFwic3dpdGNoLXNlbGVjdGVkXCI6IFwibGluZWFyLWdyYWRpZW50KDE0NmRlZywgIzVCNjE2QSAwJSwgIzNGNDM0QiAxMDAlKVwiXG4gICAgICB9LFxuICAgICAgZm9udEZhbWlseToge1xuICAgICAgICBzYW5zOiBbXG4gICAgICAgICAgXCJwbHVzLWpha2FydGEtc2Fuc1wiLFxuICAgICAgICAgIFwidWktc2Fucy1zZXJpZlwiLFxuICAgICAgICAgIFwic3lzdGVtLXVpXCIsXG4gICAgICAgICAgXCItYXBwbGUtc3lzdGVtXCIsXG4gICAgICAgICAgXCJCbGlua01hY1N5c3RlbUZvbnRcIixcbiAgICAgICAgICAnXCJTZWdvZSBVSVwiJyxcbiAgICAgICAgICBcIlJvYm90b1wiLFxuICAgICAgICAgICdcIkhlbHZldGljYSBOZXVlXCInLFxuICAgICAgICAgIFwiQXJpYWxcIixcbiAgICAgICAgICAnXCJOb3RvIFNhbnNcIicsXG4gICAgICAgICAgXCJzYW5zLXNlcmlmXCIsXG4gICAgICAgICAgJ1wiQXBwbGUgQ29sb3IgRW1vamlcIicsXG4gICAgICAgICAgJ1wiU2Vnb2UgVUkgRW1vamlcIicsXG4gICAgICAgICAgJ1wiU2Vnb2UgVUkgU3ltYm9sXCInLFxuICAgICAgICAgICdcIk5vdG8gQ29sb3IgRW1vamlcIidcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICBzd2VlcDogXCJzd2VlcCAwLjVzIGVhc2UtaW4tb3V0XCJcbiAgICAgIH0sXG4gICAgICBrZXlmcmFtZXM6IHtcbiAgICAgICAgc3dlZXA6IHtcbiAgICAgICAgICBcIjAlXCI6IHsgdHJhbnNmb3JtOiBcInNjYWxlWCgwKVwiLCB0cmFuc2Zvcm1PcmlnaW46IFwiYm90dG9tIGxlZnRcIiB9LFxuICAgICAgICAgIFwiMTAwJVwiOiB7IHRyYW5zZm9ybTogXCJzY2FsZVgoMSlcIiwgdHJhbnNmb3JtT3JpZ2luOiBcImJvdHRvbSBsZWZ0XCIgfVxuICAgICAgICB9LFxuICAgICAgICBmYWRlSW46IHtcbiAgICAgICAgICBcIjAlXCI6IHsgb3BhY2l0eTogMCB9LFxuICAgICAgICAgIFwiMTAwJVwiOiB7IG9wYWNpdHk6IDEgfVxuICAgICAgICB9LFxuICAgICAgICBmYWRlT3V0OiB7XG4gICAgICAgICAgXCIwJVwiOiB7IG9wYWNpdHk6IDEgfSxcbiAgICAgICAgICBcIjEwMCVcIjogeyBvcGFjaXR5OiAwIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgLy8gUmVxdWlyZWQgZm9yIHJlY2hhcnQgc3R5bGVzIHRvIHNob3cgc2luY2UgdGhleSBjYW4gYmUgcmVuZGVyZWQgZHluYW1pY2FsbHkgYW5kIHdpbGwgYmUgdHJlZS1zaGFrZW4gaWYgbm90IHNhZmUtbGlzdGVkLlxuICBzYWZlbGlzdDogW1xuICAgIHtcbiAgICAgIHBhdHRlcm46XG4gICAgICAgIC9eKGJnLSg/OnNsYXRlfGdyYXl8emluY3xuZXV0cmFsfHN0b25lfHJlZHxvcmFuZ2V8YW1iZXJ8eWVsbG93fGxpbWV8Z3JlZW58ZW1lcmFsZHx0ZWFsfGN5YW58c2t5fGJsdWV8aW5kaWdvfHZpb2xldHxwdXJwbGV8ZnVjaHNpYXxwaW5rfHJvc2UpLSg/OjUwfDEwMHwyMDB8MzAwfDQwMHw1MDB8NjAwfDcwMHw4MDB8OTAwfDk1MCkpJC8sXG4gICAgICB2YXJpYW50czogW1wiaG92ZXJcIiwgXCJ1aS1zZWxlY3RlZFwiXVxuICAgIH0sXG4gICAge1xuICAgICAgcGF0dGVybjpcbiAgICAgICAgL14odGV4dC0oPzpzbGF0ZXxncmF5fHppbmN8bmV1dHJhbHxzdG9uZXxyZWR8b3JhbmdlfGFtYmVyfHllbGxvd3xsaW1lfGdyZWVufGVtZXJhbGR8dGVhbHxjeWFufHNreXxibHVlfGluZGlnb3x2aW9sZXR8cHVycGxlfGZ1Y2hzaWF8cGlua3xyb3NlKS0oPzo1MHwxMDB8MjAwfDMwMHw0MDB8NTAwfDYwMHw3MDB8ODAwfDkwMHw5NTApKSQvLFxuICAgICAgdmFyaWFudHM6IFtcImhvdmVyXCIsIFwidWktc2VsZWN0ZWRcIl1cbiAgICB9LFxuICAgIHtcbiAgICAgIHBhdHRlcm46XG4gICAgICAgIC9eKGJvcmRlci0oPzpzbGF0ZXxncmF5fHppbmN8bmV1dHJhbHxzdG9uZXxyZWR8b3JhbmdlfGFtYmVyfHllbGxvd3xsaW1lfGdyZWVufGVtZXJhbGR8dGVhbHxjeWFufHNreXxibHVlfGluZGlnb3x2aW9sZXR8cHVycGxlfGZ1Y2hzaWF8cGlua3xyb3NlKS0oPzo1MHwxMDB8MjAwfDMwMHw0MDB8NTAwfDYwMHw3MDB8ODAwfDkwMHw5NTApKSQvLFxuICAgICAgdmFyaWFudHM6IFtcImhvdmVyXCIsIFwidWktc2VsZWN0ZWRcIl1cbiAgICB9LFxuICAgIHtcbiAgICAgIHBhdHRlcm46XG4gICAgICAgIC9eKHJpbmctKD86c2xhdGV8Z3JheXx6aW5jfG5ldXRyYWx8c3RvbmV8cmVkfG9yYW5nZXxhbWJlcnx5ZWxsb3d8bGltZXxncmVlbnxlbWVyYWxkfHRlYWx8Y3lhbnxza3l8Ymx1ZXxpbmRpZ298dmlvbGV0fHB1cnBsZXxmdWNoc2lhfHBpbmt8cm9zZSktKD86NTB8MTAwfDIwMHwzMDB8NDAwfDUwMHw2MDB8NzAwfDgwMHw5MDB8OTUwKSkkL1xuICAgIH0sXG4gICAge1xuICAgICAgcGF0dGVybjpcbiAgICAgICAgL14oc3Ryb2tlLSg/OnNsYXRlfGdyYXl8emluY3xuZXV0cmFsfHN0b25lfHJlZHxvcmFuZ2V8YW1iZXJ8eWVsbG93fGxpbWV8Z3JlZW58ZW1lcmFsZHx0ZWFsfGN5YW58c2t5fGJsdWV8aW5kaWdvfHZpb2xldHxwdXJwbGV8ZnVjaHNpYXxwaW5rfHJvc2UpLSg/OjUwfDEwMHwyMDB8MzAwfDQwMHw1MDB8NjAwfDcwMHw4MDB8OTAwfDk1MCkpJC9cbiAgICB9LFxuICAgIHtcbiAgICAgIHBhdHRlcm46XG4gICAgICAgIC9eKGZpbGwtKD86c2xhdGV8Z3JheXx6aW5jfG5ldXRyYWx8c3RvbmV8cmVkfG9yYW5nZXxhbWJlcnx5ZWxsb3d8bGltZXxncmVlbnxlbWVyYWxkfHRlYWx8Y3lhbnxza3l8Ymx1ZXxpbmRpZ298dmlvbGV0fHB1cnBsZXxmdWNoc2lhfHBpbmt8cm9zZSktKD86NTB8MTAwfDIwMHwzMDB8NDAwfDUwMHw2MDB8NzAwfDgwMHw5MDB8OTUwKSkkL1xuICAgIH1cbiAgXSxcbiAgcGx1Z2luczogW11cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1MsU0FBUyxvQkFBb0I7QUFDL1QsU0FBUyxlQUFlLFdBQVc7OztBQ0RxUSxPQUFPLGNBQWM7QUFDN1QsT0FBTyxrQkFBa0I7OztBQ0F6QixJQUFPLDBCQUFRO0FBQUEsRUFDYixVQUFVO0FBQUEsRUFDVixTQUFTO0FBQUEsSUFDUCxVQUFVO0FB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
