import { StringType, } from "./constants"

export type StringPropDef = {
  isUuid: boolean
  isEmail: boolean
  regex: null | string
  maxLength: null | number
  minLength: null | number
  hasCandidates: boolean
  candidates: null | string[]
}

export default function parseStringDef (def: any): StringPropDef {
  let isUuid = false
  let isEmail = false
  let regex = null
  let maxLength = null
  let minLength = null
  let candidates = null
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
  if (Array.isArray(def.candidates)) {
    candidates = def.candidates
    candidates.forEach((c: any) => {
      if (typeof c !== "string") {
        throw new Error("a candidate of a number property is not number")
      }
    })
  }
  return {
    isUuid,
    isEmail,
    regex,
    maxLength,
    minLength,
    hasCandidates: !!candidates,
    candidates,
  }
}
