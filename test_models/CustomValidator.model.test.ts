import CustomValidator, { InvalidPropertyError, } from "./CustomValidator.model"

test("Just create with valid values.", () => {
  const obj = new CustomValidator(
    "A",
    1,
  )
  expect(obj.getA()).toBe("A")
  expect(() => {
    new CustomValidator(
      "b", // Must be A but feeding B
      1,
    )
  }).toThrow(InvalidPropertyError)
})
