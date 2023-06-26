#!/usr/bin/bash

rm ./tmp/*

wget -P ./tmp http://json.schemastore.org/tsconfig
npm run ajv -- migrate -s ./tmp/tsconfig -o ./tmp/migrated_tsconfig.json
npm run ajv -- validate -s ./tmp/migrated_tsconfig.json -d ./tsconfig.json

wget -P ./tmp https://raw.githubusercontent.com/SchemaStore/schemastore/master/src/schemas/json/eslintrc.json
npm run ajv -- validate -s ./tmp/eslintrc.json -d ./eslintrc.yaml

wget -P ./tmp http://json.schemastore.org/prettierrc
npm run ajv -- migrate -s ./tmp/prettierrc -o ./tmp/migrated_prettierrc.json
npm run ajv -- validate -s ./tmp/migrated_prettierrc -d ./.prettierrc.yaml

npm run ajv -- validate -s ../../node_modules/nx/schemas/project-schema.json -d ./project.json
