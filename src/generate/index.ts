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
    const nameCamelCase = camelCase(name)
    const namePascalCase = camelCase(name, { pascalCase: true })
    const def = props[name]
    let description = def.description || null
    let type = null
    let isString = false
    let isNumber = false
    let isBoolean = false
    let isModel = false
    let modelImportPath = null
    let isArray = def.array === true
    let customValidator = def.customValidator || null
    let faker = def.faker || null
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
      modelImportPath = `./${type}`
    }
    if (type) {
      parsedProps.push({
        name,
        description,
        nameCamelCase: nameCamelCase,
        namePascalCase: namePascalCase,
        setterName: `set${namePascalCase}`,
        getterName: `get${namePascalCase}`,
        checkerName: `check${namePascalCase}`,
        type,
        isString,
        isNumber,
        isBoolean,
        isModel,
        isArray,
        modelImportPath,
        customValidator,
        faker,
        ...parsed
      })
    }
  }
  return parsedProps
}

function parseModelDef (fileName: string, def: any) {
  const { header, description, props, generate, } = def
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
  const generateFaker = !generate || generate.faker !== false && parsedProps.every(p => !!p.faker)
  const generateParser = !generate || generate.parser !== false
  return {
    class: fileName,
    header: header || null,
    description: description || null,
    props: parsedProps,
    hasUuid,
    hasEmail,
    hasUrl,
    generateFaker,
    generateParser,
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

function generateModel (modelDef: any): string {
  const templateData = fs.readFileSync(
    path.join(__dirname, "../templates/typescript/model.mustache")
  ).toString()
  return removeDuplicatedImports(
    mustache.render(templateData, modelDef)
  )
}

function generateParser (modelDef: any): string {
  const templateData = fs.readFileSync(
    path.join(__dirname, "../templates/typescript/parser.mustache")
  ).toString()
  return removeDuplicatedImports(
    mustache.render(templateData, modelDef)
  )
}

function generateFaker (modelDef: any): string {
  const templateData = fs.readFileSync(
    path.join(__dirname, "../templates/typescript/faker.mustache")
  ).toString()
  return removeDuplicatedImports(
    mustache.render(templateData, modelDef)
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
    const parsedDef = parseModelDef(fileName, def)
    const classFileData = generateModel(parsedDef)
    fs.writeFileSync(path.join(targetDir, fileName + ".model.ts"), classFileData)
    if (parsedDef.generateFaker) {
      const parserFileData = generateParser(parsedDef)
      fs.writeFileSync(path.join(targetDir, ".parser.ts"), parserFileData)
    }
    if (parsedDef.generateFaker) {
      const fakerFileData = generateFaker(parsedDef)
      fs.writeFileSync(path.join(targetDir, fileName + ".faker.ts"), fakerFileData)
    }
  })
}
