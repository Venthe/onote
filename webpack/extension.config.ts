import path from 'path';
import { Configuration, NoEmitOnErrorsPlugin } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import CopyPlugin from "copy-webpack-plugin";


const config: (environment: Record<string, string>, args: Record<string, string>) => Configuration = (environment, args) => {
    const mode: "none" | "development" | "production" | undefined = args.mode as any;
    const isProduction = mode === 'production'

    const devtool = isProduction ? "hidden-source-map" : 'nosources-source-map'
    const hints = isProduction ? false : "warning"
    const plugins = isProduction ? [
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: "extension.html",
            openAnalyzer: false
        })
    ] : [
        new NoEmitOnErrorsPlugin()
    ]

    return {
        name: "Extension",
        target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
        mode: mode, // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
        entry: './src/extension/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
        output: {
            // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
            path: path.resolve(__dirname, '../dist'),
            filename: 'extension.js',
            libraryTarget: 'commonjs2',
            devtoolModuleFilenameTemplate: '../[resource-path]'
        },
        externals: {
            vscode: 'commonjs vscode',
            'applicationinsights-native-metrics': 'commonjs applicationinsights-native-metrics'
        },
        resolve: {
            extensions: ['.ts', '.js']
        },
        module: {
            rules: [
                {
                    test: /\.m?ts$/,
                    exclude: /node_modules/,
                    use: [
                        { loader: 'babel-loader' },
                        {
                            loader: 'ts-loader'
                        }
                    ]
                },
                {
                    test: /\.m?js/,
                    resolve: {
                        fullySpecified: false
                    }
                }
            ]
        },
        performance: {
            hints: hints
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendors: {
                        test: /node_modules/,
                        chunks: 'initial',
                        filename: 'vendors.[contenthash].js',
                        priority: 1,
                        maxInitialRequests: 2, // create only one vendor file
                        minChunks: 1,
                    }
                }
            }
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    { from: "assets", to: "./" }
                ],
            }),
            ...plugins
        ],
        devtool: devtool,
        infrastructureLogging: {
            level: "log", // enables logging required for problem matchers
        }
    }
}

export default config