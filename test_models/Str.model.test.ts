import Str, { InvalidPropertyError, } from "./Str.model"

const LENGTH_1 = "0"
const LENGTH_5 = "01234"
const LENGTH_10 = "0123456789"
const URL = "http://google.com"
const EMAIL = "who@example.com"
const UUID = "051261a9-8a87-44e2-8cc7-16597e1f014f"
const APPLE = "apple"
const LOWERCASE = "skywalker"


test("Just create with valid values.", () => {
  const obj = new Str(
    LENGTH_1,
    LENGTH_5,
    LOWERCASE,
    [LENGTH_1, LENGTH_5],
    APPLE,
    UUID,
    EMAIL,
    URL,
  )
  expect(obj.getStr()).toBe(LENGTH_1)
})

test("Invalid: Less than min.", () => {
  expect(() => {
    new Str(
      LENGTH_1,
      "0",
      LOWERCASE,
      [LENGTH_1, LENGTH_5],
      APPLE,
      UUID,
      EMAIL,
      URL,
    )
  }).toThrow(InvalidPropertyError)
})

test("Invalid: more than max.", () => {
  expect(() => {
    new Str(
      LENGTH_1,
      "0123456789",
      LOWERCASE,
      [LENGTH_1, LENGTH_5],
      APPLE,
      UUID,
      EMAIL,
      URL,
    )
  }).toThrow(InvalidPropertyError)
})

test("Invalid: Does not match regex.", () => {
  expect(() => {
    new Str(
      LENGTH_1,
      LENGTH_5,
      "SKYWALKER",
      [LENGTH_1, LENGTH_5],
      APPLE,
      UUID,
      EMAIL,
      URL,
    )
  }).toThrow(InvalidPropertyError)
})

test("Invalid: Does not match candidates.", () => {
  expect(() => {
    new Str(
      LENGTH_1,
      LENGTH_5,
      LOWERCASE,
      [LENGTH_1, LENGTH_5],
      "peach",
      UUID,
      EMAIL,
      URL,
    )
  }).toThrow(InvalidPropertyError)
})

test("Invalid: Not UUID", () => {
  expect(() => {
    new Str(
      LENGTH_1,
      LENGTH_5,
      LOWERCASE,
      [LENGTH_1, LENGTH_5],
      APPLE,
      "NOT_UUID",
      EMAIL,
      URL,
    )
  }).toThrow(InvalidPropertyError)
})

test("Invalid: Not Email", () => {
  expect(() => {
    new Str(
      LENGTH_1,
      LENGTH_5,
      LOWERCASE,
      [LENGTH_1, LENGTH_5],
      LOWERCASE,
      UUID,
      "NOT_EMAIL",
      URL,
    )
  }).toThrow(InvalidPropertyError)
})

test("Invalid: Not URL", () => {
  expect(() => {
    new Str(
      LENGTH_1,
      LENGTH_5,
      LOWERCASE,
      [LENGTH_1, LENGTH_5],
      LOWERCASE,
      UUID,
      EMAIL,
      "NOT_URL",
    )
  }).toThrow(InvalidPropertyError)
})
