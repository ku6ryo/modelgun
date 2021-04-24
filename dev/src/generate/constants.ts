export enum PrimitiveType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
}

export enum StringType {
  STRING = "string",
  UUID = "uuid",
  EMAIL = "email",
  URL = "url",
}

export enum NumberType {
  INTERGER = "int",
  FLOAT = "float",
}

export enum BooleanType {
  BOOLEAN = "boolean"
}

export const STRING_TYPES = [
  StringType.STRING,
  StringType.EMAIL,
  StringType.URL,
  StringType.UUID,
]
export const NUMBER_TYPES = [
  NumberType.INTERGER,
  NumberType.FLOAT,
]
