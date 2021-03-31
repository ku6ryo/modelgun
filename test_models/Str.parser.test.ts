import parseStr, { ParseError, } from "./Str.parser"

const LENGTH_1 = "0"
const LENGTH_5 = "01234"
const URL = "http://google.com"
const EMAIL = "who@example.com"
const UUID = "051261a9-8a87-44e2-8cc7-16597e1f014f"
const APPLE = "apple"
const LOWERCASE = "skywalker"

test("Just create with valid values.", () => {
  const input = {
    "str": LENGTH_1,
    "strMinMaxLength": LENGTH_5,
    "strRegex": LOWERCASE,
    "strArray": [LENGTH_1, LENGTH_5],
    "strCandidates": APPLE,
    "uuid": UUID,
    "email": EMAIL,
    "url": URL,
  }
  const parsed = parseStr(input)
  expect(parsed.getStr()).toBe(LENGTH_1)
})
