const { override, fixBabelImports, addLessLoader } = require("customize-cra");
const addWebpackTarget = () => config => {
  config.output.globalObject = "self";
  return config
};

module.exports = override(
  addWebpackTarget(),
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: true,
  }),
  addLessLoader({
    lessOptions: {
      javascriptEnabled: true,
      modifyVars: {
        "@table-row-hover-bg": "#EBF8FF",
      },
    },
  })
);
