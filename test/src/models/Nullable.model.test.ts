import Nullable from "./Nullable.model"
import NullableChild from "./NullableChild.model"

test("all null", () => {
  const nullable = new Nullable(null, null, null)
  expect(nullable.getNullableInt()).toBeNull()
  expect(nullable.getNullableString()).toBeNull()
  expect(nullable.getNullableRef()).toBeNull()
})

test("all null clone", () => {
  const nullable = new Nullable(null, null, null)
  const clone = nullable.clone(true)
  expect(clone.getNullableInt()).toBeNull()
  expect(clone.getNullableString()).toBeNull()
  expect(clone.getNullableRef()).toBeNull()
})

test("all null toObject", () => {
  const nullable = new Nullable(null, null, null)
  const obj = nullable.toObject()
  expect(obj.nullableInt).toBeNull()
  expect(obj.nullableString).toBeNull()
  expect(obj.nullableRef).toBeNull()
})

test("with values", () => {
  const child = new NullableChild(0, "a")
  const nullable = new Nullable(1, "b", child)
  expect(nullable.getNullableInt()).toBe(1)
  expect(nullable.getNullableString()).toBe("b")
  expect(nullable.getNullableRef()).toBe(child)
})

test("with values clone deep", () => {
  const child = new NullableChild(0, "a")
  const nullable = new Nullable(1, "b", child)
  const clone = nullable.clone(false)
  expect(clone.getNullableInt()).toBe(1)
  expect(clone.getNullableString()).toBe("b")
  expect(clone.getNullableRef()).not.toBe(child)
  expect(child.getNullableInt()).toBe(0)
  expect(child.getNullableString()).toBe("a")
})

test("with values clone shallow", () => {
  const child = new NullableChild(0, "a")
  const nullable = new Nullable(1, "b", child)
  const clone = nullable.clone(true)
  expect(clone.getNullableInt()).toBe(1)
  expect(clone.getNullableString()).toBe("b")
  expect(clone.getNullableRef()).toBe(child)
})

test("with values toObject", () => {
  const child = new NullableChild(0, "a")
  const nullable = new Nullable(1, "b", child)
  const obj = nullable.toObject()
  expect(obj.nullableInt).toBe(1)
  expect(obj.nullableString).toBe("b")
  expect(obj.nullableRef).not.toBeNull()
  expect(obj.nullableRef!.nullableInt).toBe(0)
  expect(obj.nullableRef!.nullableString).toBe("a")
})
