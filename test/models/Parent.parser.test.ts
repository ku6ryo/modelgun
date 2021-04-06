import parseParent, { ParseError, } from "./Parent.parser"

test("Just parse nested object.", () => {
  const input = {
    child: {
      name: "michael",
      children: [{
        name: "bob",
      }, {
        name: "anna",
      }]
    },
  }
  const parsed = parseParent(input)
  expect(parsed.getChild().getName()).toBe("michael")
  expect(parsed.getChild().getChildren()[0].getName()).toBe("bob")
  expect(parsed.getChild().getChildren()[1].getName()).toBe("anna")
})
