export default {
  port: 8000,
  proxy: {
    "/api": "http://localhost:5000/",
  },
};
