"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const toml_1 = __importDefault(require("toml"));
const mustache_1 = __importDefault(require("mustache"));
const camelcase_1 = __importDefault(require("camelcase"));
const parseStringDef_1 = __importDefault(require("./parseStringDef"));
const parseNumberDef_1 = __importDefault(require("./parseNumberDef"));
const constants_1 = require("./constants");
function parseProps(props) {
    const parsedProps = [];
    for (let name in props) {
        const nameCamelCase = camelcase_1.default(name);
        const namePascalCase = camelcase_1.default(name, { pascalCase: true });
        const def = props[name];
        let description = def.description || null;
        let type = null;
        let isString = false;
        let isNumber = false;
        let isBoolean = false;
        let isModel = false;
        let modelImportPath = null;
        let isArray = def.array === true;
        let customValidator = def.customValidator || null;
        let faker = def.faker || null;
        let parsed = null;
        if (constants_1.STRING_TYPES.includes(def.type)) {
            isString = true;
            type = constants_1.PrimitiveType.STRING;
            parsed = parseStringDef_1.default(def);
        }
        else if (constants_1.NUMBER_TYPES.includes(def.type)) {
            isNumber = true;
            type = constants_1.PrimitiveType.NUMBER;
            parsed = parseNumberDef_1.default(def);
        }
        else if (def.type === constants_1.BooleanType.BOOLEAN) {
            isBoolean = true;
            type = constants_1.BooleanType.BOOLEAN;
        }
        else if (def.type.startsWith("ref:")) {
            isModel = true;
            type = def.type.replace(/^ref:/, "");
            modelImportPath = `./${type}`;
        }
        if (type) {
            parsedProps.push(Object.assign({ name,
                description, nameCamelCase: nameCamelCase, namePascalCase: namePascalCase, setterName: `set${namePascalCase}`, getterName: `get${namePascalCase}`, checkerName: `check${namePascalCase}`, type,
                isString,
                isNumber,
                isBoolean,
                isModel,
                isArray,
                modelImportPath,
                customValidator,
                faker }, parsed));
        }
    }
    return parsedProps;
}
function parseModelDef(fileName, def) {
    const { header, description, props, generate, } = def;
    if (header !== undefined && typeof header !== "string") {
        throw new Error("Header must be a string.");
    }
    if (description !== undefined && typeof description !== "string") {
        throw new Error("Header must be a string.");
    }
    const parsedProps = parseProps(props);
    // Checks validations requires libraries.
    const hasUuid = parsedProps.some(p => {
        const prop = p;
        return prop.isUuid === true;
    });
    const hasEmail = parsedProps.some(p => {
        const prop = p;
        return prop.isEmail === true;
    });
    const hasUrl = parsedProps.some(p => {
        const prop = p;
        return prop.isUrl === true;
    });
    const generateFaker = !generate || generate.faker !== false && parsedProps.every(p => !!p.faker);
    const generateParser = !generate || generate.parser !== false;
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
    };
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
function removeDuplicatedImports(code) {
    const duplicatedLineNumbers = [];
    const lines = code.split("\n");
    const importLines = [];
    lines.forEach((l, i) => {
        if (l.startsWith("import") && l.includes("from")) {
            if (importLines.includes(l)) {
                duplicatedLineNumbers.push(i);
            }
            else {
                importLines.push(l);
            }
        }
    });
    return lines.filter((_, i) => !duplicatedLineNumbers.includes(i)).join("\n");
}
function generateModel(modelDef) {
    const templateData = fs.readFileSync(path.join(__dirname, "../templates/typescript/model.mustache")).toString();
    return removeDuplicatedImports(mustache_1.default.render(templateData, modelDef));
}
function generateParser(modelDef) {
    const templateData = fs.readFileSync(path.join(__dirname, "../templates/typescript/parser.mustache")).toString();
    return removeDuplicatedImports(mustache_1.default.render(templateData, modelDef));
}
function generateFaker(modelDef) {
    const templateData = fs.readFileSync(path.join(__dirname, "../templates/typescript/faker.mustache")).toString();
    return removeDuplicatedImports(mustache_1.default.render(templateData, modelDef));
}
function isModelDefFile(filePath) {
    const parts = path.basename(filePath).split(".");
    return parts.length === 3 && parts[1] === "model" && parts[2] === "toml";
}
/**
 * Generates model files and parser files of model definition files in a given
 * target directory.
 * @param options GenerateOption
 */
function generate(options) {
    const { targetDir, } = options;
    if (!fs.existsSync(targetDir)) {
        throw new Error("Target dirctory does not exist. " + targetDir);
    }
    const candidateFiles = fs.readdirSync(targetDir);
    const targetFiles = candidateFiles.filter(filePath => {
        return isModelDefFile(filePath);
    });
    targetFiles.forEach(targetFile => {
        const targetFilePath = path.join(targetDir, targetFile);
        console.log(targetFile);
        const text = fs.readFileSync(targetFilePath).toString();
        const def = toml_1.default.parse(text);
        const fileName = path.basename(targetFile).split(".")[0];
        const parsedDef = parseModelDef(fileName, def);
        const classFileData = generateModel(parsedDef);
        fs.writeFileSync(path.join(targetDir, fileName + ".model.ts"), classFileData);
        if (parsedDef.generateFaker) {
            const parserFileData = generateParser(parsedDef);
            fs.writeFileSync(path.join(targetDir, ".parser.ts"), parserFileData);
        }
        if (parsedDef.generateFaker) {
            const fakerFileData = generateFaker(parsedDef);
            fs.writeFileSync(path.join(targetDir, fileName + ".faker.ts"), fakerFileData);
        }
    });
}
exports.default = generate;
