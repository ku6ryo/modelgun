import * as fs from "fs"
import * as path from "path"
import toml from "toml"
import mustache from "mustache"
import camelCase from "camelcase"

enum PrimitiveType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
}

enum StringType {
  STRING = "string",
  UUID = "uuid",
  EMAIL = "email",
  URL = "url",
}

enum NumberType {
  NUMBER = "number",
  INTERGER = "int",
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
const NUMBER_TYPES = [
  NumberType.NUMBER,
  NumberType.INTERGER,
]

type BaseTypeDef = {
  type: string
  isArray: boolean
}

type NumberPropDef = {
  max: null | number
  min: null | number
  isInt: boolean
}

type StringPropDef = {
  isUuid: boolean
  isEmail: boolean
  regex: null | string
  maxLength: null | number
  minLength: null | number
}

function parseNumberDef (def: any): NumberPropDef {
  let max = null
  let min = null
  let isInt = false
  if (typeof def.min === "number") {
    min = def.min
  }
  if (typeof def.max === "number") {
    max = def.max
  }
  isInt = def.type === NumberType.INTERGER
  return {
    max,
    min,
    isInt,
  }
}

function parseStringDef (def: any): StringPropDef {
  let isUuid = false
  let isEmail = false
  let regex = null
  let maxLength = null
  let minLength = null
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
  if (typeof def.regex === "string") {
    regex = def.regex
  }
  isUuid = def.type === StringType.UUID
  isEmail = def.type === StringType.EMAIL
  return {
    isUuid,
    isEmail,
    regex,
    maxLength,
    minLength,
  }
}

function parseProps (props: any[]) {
  const parsedProps = []
  for (let name in props) {
    const propertyCamelCase = camelCase(name)
    const propertyPascalCase = camelCase(name, { pascalCase: true })
    const def = props[name]
    let description = def.description || null
    let type = null
    let importFilePath = null
    let isArray = def.array === true
    let parsed: StringPropDef | NumberPropDef | null = null
    if (STRING_TYPES.includes(def.type)) {
      type = PrimitiveType.STRING
      parsed = parseStringDef(def)
    } else if (NUMBER_TYPES.includes(def.type)) {
      type = PrimitiveType.NUMBER
      parsed = parseNumberDef(def)
    } else if (def.type === BooleanType.BOOLEAN) {
      type = BooleanType.BOOLEAN
    } else if (def.type.startsWith("ref:")) {
      importFilePath = def.type.replace(/^ref:/, "")
      type = importFilePath.replace(/^[^/]\//, "")
    }
    if (type) {
      parsedProps.push({
        name,
        description,
        nameCamelCase: propertyCamelCase,
        namePascalCase: propertyPascalCase,
        setterName: `set${propertyPascalCase}`,
        getterName: `get${propertyPascalCase}`,
        checkerName: `check${propertyPascalCase}`,
        isArray,
        importFilePath,
        type,
        ...parsed
      })
    }
  }
  return parsedProps
}

function parseModelData (className: string, props: any) {
  const parsedProps = parseProps(props)
  // Checks validations requires libraries.
  const hasUuid = parsedProps.some(p => {
    const prop = p as any
    return prop.isUUid === true
  })
  const hasEmail = parsedProps.some(p => {
    const prop = p as any
    return prop.isEmail === true
  })
  return {
    class: className,
    props: parsedProps,
    hasUuid,
    hasEmail,
  }
}

/**
 * Remove duplicated import lines.
 * e.g. Remove one of the below import line.
 * import a from "b"
 * import a from "b"
 * TODO fix potential bug. Duplication of the below code cannot be removed.
 * import {
 *  a,
 * } from "b"
 */
function removeDuplicatedImports(code: string) {
  const duplicatedLineNumbers: number[] = []
  const lines = code.split("\n")
  const importLines: string[] = []
  lines.forEach((l, i) => {
    if (l.startsWith("import") && l.includes("from")) {
      if (importLines.includes(l)) {
        duplicatedLineNumbers.push(i)
      } else {
        importLines.push(l)
      }
    }
  })
  return lines.filter((_, i) => !duplicatedLineNumbers.includes(i)).join("\n")
}

function generateClass (className: string, props: any): string {
  const modelData = parseModelData(className, props)
  const templateData = fs.readFileSync(
    path.join(__dirname, "./templates/typescript/model.mustache")
  ).toString()
  return removeDuplicatedImports(
    mustache.render(templateData, modelData)
  )
}

function generateParser (className: string, props: any): string {
  const modelData = parseModelData(className, props)
  const templateData = fs.readFileSync(
    path.join(__dirname, "./templates/typescript/parser.mustache")
  ).toString()
  return removeDuplicatedImports(
    mustache.render(templateData, modelData)
  )
}

function isModelDefFile(filePath: string) {
  const parts = path.basename(filePath).split(".")
  return parts.length === 3 && parts[1] === "model" && parts[2] === "toml"
}

type GenerateOption = {
  targetDir: string,
}

/**
 * Generates model files and parser files of model definition files in a given
 * target directory.
 * @param options GenerateOption
 */
export default function generate(options: GenerateOption) {
  const targetDir = options.targetDir
  const candidateFiles = fs.readdirSync(targetDir)
  const targetFiles = candidateFiles.filter(filePath => {
    return isModelDefFile(filePath)
  })
  targetFiles.forEach(targetFile => {
    const targetFilePath = targetDir + "/" + targetFile
    console.log(targetFile)
    const text = fs.readFileSync(targetFilePath).toString()
    const def = toml.parse(text)
    const className = path.basename(targetFile).split(".")[0]
    const classFileData = generateClass(className, def.props)
    fs.writeFileSync(path.join(targetDir, className + ".ts"), classFileData)
    const parserFileData = generateParser(className, def.props)
    fs.writeFileSync(path.join(targetDir, className + ".parser.ts"), parserFileData)
  })
}
