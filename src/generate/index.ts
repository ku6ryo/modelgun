import * as fs from "fs"
import * as path from "path"
import toml from "toml"
import mustache from "mustache"
import camelCase from "camelcase"
import parseStringDef, { StringPropDef, } from "./parseStringDef"
import parseNumberDef, { NumberPropDef, } from "./parseNumberDef"
import { PrimitiveType, STRING_TYPES, NUMBER_TYPES, BooleanType, } from "./constants"

function parseProps (props: any[]) {
  const parsedProps = []
  for (let name in props) {
    const propertyCamelCase = camelCase(name)
    const propertyPascalCase = camelCase(name, { pascalCase: true })
    const def = props[name]
    let description = def.description || null
    let type = null
    let isString = false
    let isNumber = false
    let isBoolean = false
    let isModel = false
    let importFilePath = null
    let isArray = def.array === true
    let customValidator = def.customValidator || null
    let parsed: StringPropDef | NumberPropDef | null = null
    if (STRING_TYPES.includes(def.type)) {
      isString = true
      type = PrimitiveType.STRING
      parsed = parseStringDef(def)
    } else if (NUMBER_TYPES.includes(def.type)) {
      isNumber = true
      type = PrimitiveType.NUMBER
      parsed = parseNumberDef(def)
    } else if (def.type === BooleanType.BOOLEAN) {
      isBoolean = true
      type = BooleanType.BOOLEAN
    } else if (def.type.startsWith("ref:")) {
      isModel = true
      type = def.type.replace(/^ref:/, "")
      importFilePath = `./${type}`
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
        type,
        isString,
        isNumber,
        isBoolean,
        isModel,
        isArray,
        importFilePath,
        customValidator,
        ...parsed
      })
    }
  }
  return parsedProps
}

function parseModelDef (fileName: string, def: any) {
  const { header, description, props, } = def
  if (header !== undefined && typeof header !== "string") {
    throw new Error("Header must be a string.")
  }
  if (description !== undefined && typeof description !== "string") {
    throw new Error("Header must be a string.")
  }
  const parsedProps = parseProps(props)
  // Checks validations requires libraries.
  const hasUuid = parsedProps.some(p => {
    const prop = p as any
    return prop.isUuid === true
  })
  const hasEmail = parsedProps.some(p => {
    const prop = p as any
    return prop.isEmail === true
  })
  const hasUrl = parsedProps.some(p => {
    const prop = p as any
    return prop.isUrl === true
  })
  return {
    class: fileName,
    header: header || null,
    description: description || null,
    props: parsedProps,
    hasUuid,
    hasEmail,
    hasUrl,
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

function generateModel (fileName: string, def: any): string {
  const modelData = parseModelDef(fileName, def)
  const templateData = fs.readFileSync(
    path.join(__dirname, "../templates/typescript/model.mustache")
  ).toString()
  return removeDuplicatedImports(
    mustache.render(templateData, modelData)
  )
}

function generateParser (fileName: string, def: any): string {
  const modelData = parseModelDef(fileName, def)
  const templateData = fs.readFileSync(
    path.join(__dirname, "../templates/typescript/parser.mustache")
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
  const { targetDir, } = options
  if (!fs.existsSync(targetDir)) {
    throw new Error("Target dirctory does not exist. " + targetDir)
  }
  const candidateFiles = fs.readdirSync(targetDir)
  const targetFiles = candidateFiles.filter(filePath => {
    return isModelDefFile(filePath)
  })
  targetFiles.forEach(targetFile => {
    const targetFilePath = path.join(targetDir, targetFile)
    console.log(targetFile)
    const text = fs.readFileSync(targetFilePath).toString()
    const def = toml.parse(text)
    const fileName = path.basename(targetFile).split(".")[0]
    const classFileData = generateModel(fileName, def)
    fs.writeFileSync(path.join(targetDir, fileName + ".model.ts"), classFileData)
    const parserFileData = generateParser(fileName, def)
    fs.writeFileSync(path.join(targetDir, fileName + ".parser.ts"), parserFileData)
  })
}
