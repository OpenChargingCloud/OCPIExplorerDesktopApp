#!/bin/bash

#tsc -p tsconfig.json
sass src/css/ocpiExplorer.scss src/css/ocpiExplorer.css
webpack -c webpack.config.cjs

npm start --silent -- --inspect "$@"
