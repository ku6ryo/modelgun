rm -rf ../dist/src/**/*.js
rm -rf ../dist/src/**/*.mustache
./node_modules/typescript/bin/tsc --project tsconfig.json
mkdir ../dist/src/templates
cp -r src/templates/* ../dist/src/templates
