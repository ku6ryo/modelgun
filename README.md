Model Gun - Data model handling auto-gen tool

# Overview
This is a tool to generate model classes and related utils with validations.

# Model definition file spec
This tool use [toml](https://github.com/toml-lang/toml) as the format of definition file.

## prop
Defines prop as follows.
```
[prop.uuid]
type = uuid
```
```
[prop.num]
type = int32
```
# type
- string
- number
- boolean
- uuid
- email
- float
- int
