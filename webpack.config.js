import withCSS from "@zeit/next-css";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";

module.exports = withCSS({
  webpack(config, options) {
    config.plugins.push(new MonacoWebpackPlugin());
    return config;
  },
  cssLoaderOptions: { url: false },
});
