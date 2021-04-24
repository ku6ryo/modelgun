import { NumberType, } from "./constants"

export type NumberPropDef = {
  max: null | number
  min: null | number
  isInt: boolean,
  hasCandidates: boolean,
  candidates: null | number[]
}

export default function parseNumberDef (def: any): NumberPropDef {
  let max = null
  let min = null
  let isInt = false
  let candidates = null
  if (typeof def.min === "number") {
    min = def.min
  }
  if (typeof def.max === "number") {
    max = def.max
  }
  isInt = def.type === NumberType.INTERGER
  if (Array.isArray(def.candidates)) {
    candidates = def.candidates
    candidates.forEach((c: any) => {
      if (typeof c !== "number") {
        throw new Error("a candidate of a number property is not number")
      }
    })
  }
  return {
    max,
    min,
    isInt,
    hasCandidates: !!candidates,
    candidates,
  }
}
