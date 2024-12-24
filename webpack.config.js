import withCSS from "@zeit/next-css";
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";

module.exports = withCSS({
  webpack(config, options) {
    config.plugins.push(
      new MonacoWebpackPlugin({
        languages: [
          "json",
          "javascript",
          "typescript",
          "css",
          "html",
          "markdown",
          "python",
          "java",
          "csharp",
          "go",
          "ruby",
          "plaintext",
        ],
      })
    );
    return config;
  },
  cssLoaderOptions: { url: false },
});
