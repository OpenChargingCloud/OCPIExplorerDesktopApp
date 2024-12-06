const path = require('path');

// webpack.config.js
module.exports = [
    {
      mode:    'development',
      entry:   './src/ts/ocpiApp.ts',
      target:  'electron-renderer',
      devtool: "eval-source-map",
      resolve: {
        extensions: ["", ".ts", ".js"]
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            //include: /src/,
            use: [{ loader: 'ts-loader' }]
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
          },
          {
            test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
            type: 'asset/resource',
            generator: {
              filename: 'assets/fonts/[name][ext][query]' // Path and naming of your fonts
            }
          }
        ]
      },
      externals: {
      //  'http': 'commonjs2 http'
      //  'asn1':         'asn1.js',
      //  'base32decode': 'base32-decode'
      },
      output: {
        filename: 'OCPIExplorer-bundle.js',
        path: path.resolve(__dirname, 'src', 'build')
      }
    }
  ];
