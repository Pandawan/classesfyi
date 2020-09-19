export default {
  port: 5000,
  proxy: {
    "/api": "http://localhost:3000",
  },
};
