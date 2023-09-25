import path from "path";
import { Configuration as WebpackConfiguration } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { WebpackManifestPlugin } from 'webpack-manifest-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const configuration = (_env, argv): WebpackConfiguration => {
  const isProduction = argv.mode === "production";
  const isDevelopment = !isProduction;

  return {
    optimization: {
      chunkIds: 'deterministic',
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader'
          ],
          exclude: /\.module\.css$/
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'ts-loader'
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.svg$/,
          use: 'file-loader'
        },
        {
          test: /\.png$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                mimetype: 'image/png'
              }
            }
          ]
        }
      ]
    },
    mode: isProduction ? "production" : "development",
    devtool: isDevelopment && "cheap-module-source-map", //'inline-source-map'
    entry: "./src/index.tsx",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].[contenthash].js",
      publicPath: "/"
    },
    resolve: {
      extensions: [
        '.tsx',
        '.ts',
        '.js',
        '.jsx'
      ],
    },
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
      }),
      new MiniCssExtractPlugin(),
      new WebpackManifestPlugin({})
    ],
  };
}

export default configuration