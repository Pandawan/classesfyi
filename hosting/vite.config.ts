import vue from "@vitejs/plugin-vue";
import path from "path";

export default {
  plugins: [vue()],
  server: {
    port: 8000,
    proxy: {
      "/api": "http://localhost:5000/",
    },
  },
  alias: {
    "/@": path.resolve(__dirname, "src"),
  },
};
