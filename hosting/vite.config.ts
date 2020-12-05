import path from "path";

export default {
  port: 8000,
  proxy: {
    "/api": "http://localhost:5000/",
  },
  alias: {
    "/@/": path.resolve(__dirname, "src"),
  },
};
