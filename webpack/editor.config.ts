import path from 'path';
import { Configuration, NoEmitOnErrorsPlugin } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import CopyPlugin from "copy-webpack-plugin";

const config: (environment: Record<string, string>, args: Record<string, string>) => Configuration = (environment, args) => {
    const mode: "none" | "development" | "production" | undefined = args.mode as any;
    const isProduction = mode === 'production'
    const isWeb = (environment.type ?? "") === 'web';
    const plugins = [
        ...(isProduction ? [
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                reportFilename: "editor.html",
                openAnalyzer: false
            })
        ] : [
            new NoEmitOnErrorsPlugin()
        ]),
        ...(isWeb ? [
            new CopyPlugin({
                patterns: [
                    { from: "assets/web.html", to: "./index.html" }
                ],
            })
        ] : [])
    ]

    const publicPath = isProduction ? {} : { publicPath: "http://localhost:3000" }

    return {
        name: "Editor",
        target: 'web',
        mode: mode,
        entry: './src/editor/index.tsx',
        output: {
            filename: '[name].wv.js',
            path: path.resolve(__dirname, '../dist')
        },
        resolve: {
            extensions: ['.js', '.ts', '.tsx', "jsx"],
        },
        optimization: {
            emitOnErrors: false
        },
        devtool: 'source-map',
        devServer: {
            compress: true,
            port: 3000,
            host: "localhost",
            allowedHosts: "all",
            headers: {
                "Access-Control-Allow-Origin": "*",
            }
        },
        plugins: [...plugins],
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        { loader: 'babel-loader' },
                        {
                            loader: 'ts-loader'
                        }
                    ]
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        // Creates `style` nodes from JS strings
                        "style-loader",
                        // Translates CSS into CommonJS
                        "css-loader",
                        // Compiles Sass to CSS
                        "sass-loader",
                    ],
                },
            ],
        },
    }
};

export default config