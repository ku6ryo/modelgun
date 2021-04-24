$level="$1"

cd dev
npm version $1
cd ..

cd dist
npm version $1
cd ..

cd test
npm version $1
