import * as fs from "fs"
import * as path from "path"
import toml from "toml"
import mustache from "mustache"
import camelCase from "camelcase"



enum PrimitiveType {
  STRING = "string",
  NUMBER = "number",
}

enum StringType {
  STRING = "string",
  UUID = "uuid",
  EMAIL = "email",
  URL = "url",
}

enum NumberType {
  NUMBER = "number",
}

enum BooleanType {
  BOOLEAN = "boolean"
}

const STRING_TYPES = [
  StringType.STRING,
  StringType.EMAIL,
  StringType.URL,
  StringType.UUID,
]
const NUMBER_TYPES = [NumberType.NUMBER]

function generateBaseData (className: string, fields: any) {
  let hasUuid = false
  let hasEmail = false
  const cleanFields = []
  for (let property in fields) {
    const propertyCamelCase = camelCase(property)
    const propertyPascalCase = camelCase(property, { pascalCase: true })
    let type = null
    const def = fields[property]
    let importFilePath = null
    let isUuid = false
    let isEmail = false
    let maxLength = null
    let minLength = null
    if (STRING_TYPES.includes(def.type)) {
      type = PrimitiveType.STRING
      if (typeof def.maxLength === "number"
        && def.maxLength > 0
      ) {
        maxLength = def.maxLength
      }
      if (typeof def.minLength === "number"
        && def.minLength >= 0
      ) {
        minLength = def.minLength
      }
      isUuid = def.type === StringType.UUID
      isEmail = def.type === StringType.EMAIL
      hasUuid = hasUuid || isUuid
      hasEmail = hasEmail || isEmail
    } else if (NUMBER_TYPES.includes(def.type)) {
      type = PrimitiveType.NUMBER
    } else if (def.type === BooleanType.BOOLEAN) {
      type = BooleanType.BOOLEAN
    } else if (def.type.startsWith("ref:")) {
      importFilePath = def.type.replace(/^ref:/, "")
      type = importFilePath.replace(/^[^/]\//, "")
    }
    cleanFields.push({
      name: property,
      nameCamelCase: propertyCamelCase,
      namePascalCase: propertyPascalCase,
      setterName: `set${propertyPascalCase}`,
      getterName: `get${propertyPascalCase}`,
      isUuid: def.type === StringType.UUID,
      isEmail: def.type === StringType.EMAIL,
      maxLength,
      minLength,
      importFilePath,
      type,
    })
  }
  return {
    class: className,
    fields: cleanFields,
    hasUuid,
    hasEmail,
  }
}

function generateClass (className: string, fields: any) {
  const baseData = generateBaseData(className, fields)
  const templateData = fs.readFileSync(
    path.join(__dirname, "./templates/typescript/model.mustache")
  ).toString()
  return mustache.render(templateData, baseData)
}

function generateParser (className: string, fields: any) {
  const baseData = generateBaseData(className, fields)
  const templateData = fs.readFileSync(
    path.join(__dirname, "./templates/typescript/parser.mustache")
  ).toString()
  return mustache.render(templateData, baseData)
}

type GenerateOption = {
  targetDir: string,
}

export default function generate(options: GenerateOption) {
  const targetDir = options.targetDir
  const candidateFiles = fs.readdirSync(targetDir)
  const targetFiles = candidateFiles.filter(filePath => {
    const parts = path.basename(filePath).split(".")
    return parts.length === 3 && parts[1] === "mdef" && parts[2] === "toml"
  })
  targetFiles.forEach(targetFile => {
    const targetFilePath = targetDir + "/" + targetFile
    console.log(targetFile)
    const text = fs.readFileSync(targetFilePath).toString()
    const def = toml.parse(text)
    const className = path.basename(targetFile).split(".")[0]
    const classFileData = generateClass(className, def.fields)
    fs.writeFileSync(path.join(targetDir, className + ".ts"), classFileData)
    const parserFileData = generateParser(className, def.fields)
    fs.writeFileSync(path.join(targetDir, className + ".parser.ts"), parserFileData)
  })
}
