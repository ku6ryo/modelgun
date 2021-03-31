import { NumberType, } from "./constants"

export type NumberPropDef = {
  max: null | number
  min: null | number
  isInt: boolean
}

export default function parseNumberDef (def: any): NumberPropDef {
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
