import Parent from "./Parent.model"
import Child from "./Child.model"
import Grandchild from "./Grandchild.model"

test("Just parse nested object.", () => {
  const grandchild1 = new Grandchild("bob")
  const grandchild2 = new Grandchild("anna")
  const child = new Child("michael", [grandchild1, grandchild2])
  const parent = new Parent(child)
  expect(parent.getChild()).toBe(child)
  expect(child.getChildren()[0]).toBe(grandchild1)
  expect(child.getChildren()[1]).toBe(grandchild2)

  // Clones
  const deepClone = parent.clone(false)
  expect(deepClone.getChild()).not.toBe(child)
  expect(deepClone.getChild().getName()).toBe("michael")
  expect(deepClone.getChild().getChildren()[0].getName()).toBe("bob")
  expect(deepClone.getChild().getChildren()[1].getName()).toBe("anna")

  const shallowClone = parent.clone(true)
  expect(shallowClone.getChild()).toBe(child)

  // Object
  const obj = parent.toObject()
  expect(obj.child.name).toBe("michael")
  expect(obj.child.children[0].name).toBe("bob")
  expect(obj.child.children[1].name).toBe("anna")
})
