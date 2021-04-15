rm -rf dist
./node_modules/typescript/bin/tsc --project tsconfig.json
mkdir dist/templates
cp -r src/templates/* dist/templates
