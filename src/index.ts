import generate from "./generate"

console.log("Model Gen")
console.log(process.argv)

enum Command {
  GENERATE = "gen"
}

const command = process.argv[2]
switch (command) {
  case Command.GENERATE:
    generateInterface(process.argv.slice(3))
    break
  default:
    break
}

function generateInterface (args: string[]) {
  generate({
    targetDir: args[0]
  })
}
