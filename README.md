Modelgun - Data model handling auto-gen tool for Node.js

# Overview
This is a tool to generate model classes and related utils with validations.
Currently following files are generated.

- model
- parser
- faker (Beta)

## What is Modelgun?
Modelguns are Japanese replica or toy guns, which are usually made of zinc alloys or plastic materials. Most modelguns commonly available today are designed to highly replicate the physical appearance (some bear the authentic trademarks and markings too) and in full scale of the real gun counterpart.
https://en.wikipedia.org/wiki/Modelguns

# Supported languages
Currently only TypeScript is supported. If number of users increase, will consider
to write JavaScript version.

# Command
To execute command to run generator use following command.
modelgun Generates definition files in a specified directory.
```
modelgun gen path/to/dir
```

# Model definition file spec
This tool use [toml](https://github.com/toml-lang/toml) as the format of definition file. `[MODEL_NAME].model.toml` is the file to

## Settings
Model setting parameters.

### description
Description about the model.
```
description = "This is the data structure to "
```

## Generator
- parser: Whether to generate a parser file.
- faker: Whether to generate a faker file.
```
[generator]
parser = false
faker = true
```

## prop
`prop` Defines model properties. Property name follows after `prop`.

```
[prop.name]
type = "string"
```

### type
Type of property. Please use supported types.
```
[prop.str]
type = "int"
```

Supported types
- string
- boolean
- uuid
- email
- float
- int

#### Referring another model
Use "ref:[MODEL_NAME]"

TODO: Let users to use file path to a model.

### validation
Depending on the type, modelgun auto generates validation code in model class.
Additionally, you can specify detailed validation.

#### Number
- min
- max
- candidates

#### String
- regex
- maxLength
- minLength
- candidates
