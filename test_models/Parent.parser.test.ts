import parseParent, { ParseError, } from "./Parent.parser"

test("Just parse nested object.", () => {
  const input = {
    child: {
      name: "michael",
      child: {
        name: "anna"
      }
    },
    children: [{
      name: "bob",
      child: {
        name: "betty"
      },
    }, {
      name: "kieth",
      child: {
        name: "justin"
      },
    }]
  }
  const parsed = parseParent(input)
  expect(parsed.getChild().getName()).toBe("michael")
  expect(parsed.getChild().getChild().getName()).toBe("anna")
  expect(parsed.getChildren()[0].getName()).toBe("bob")
  expect(parsed.getChildren()[0].getChild().getName()).toBe("betty")
  expect(parsed.getChildren()[1].getName()).toBe("kieth")
  expect(parsed.getChildren()[1].getChild().getName()).toBe("justin")
})
