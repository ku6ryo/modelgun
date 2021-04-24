import generate from "./generate"

enum Command {
  GENERATE = "gen"
}

export default function main () {
  const command = process.argv[2]
  switch (command) {
    case Command.GENERATE:
      generateInterface(process.argv.slice(3))
      break
    default:
      break
  }
}

/**
 * Generate command interface.
 */
function generateInterface (args: string[]) {
  console.log("Generating models")
  try {
    generate({
      targetDir: args[0]
    })
  } catch (e) {
    console.log("Failed with Error")
    console.log(e)
  }
}
