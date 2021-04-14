Modelgun - Data model and util auto-gen tool for Node.js

# Overview
This is a tool to generate model classes and related utils with validations.
Currently following files are generated.

- model: A class to represent a model which validation methods.
- parser: Parser to convert any object to models.
- faker (alpha): Fake value generation tool for tests.

# Motivation
We write data validation code so many times to build a system. But the work is
very boring, time consuming and can be done by robots. What human should do is
just design the structures of models and defines the validation rules.
This tool make you free from the boring works and your life will be easier 😃.

# Example
Example model definition files and generated files are stored [here](https://github.com/ku6ryo/modelgun/tree/master/examples).

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

## Top level options
Model setting parameters.

### description
Description about the model.
```toml
description = "This is the data structure to "
```

### header
Header is placed at the top of auto-generated model file. You can write anything like constants, import statements and functions. This was introduced for custom validations.
But you may find more cases. Please let us know if you find some.
```toml
header = "
// Importing
import anyFunc from "./path/to/file"

function customValidator (value: string) {
  ...
}
"
```

## Generator
- parser: Whether to generate a parser file.
- faker: Whether to generate a faker file.
```toml
[generator]
parser = false
faker = true
```

## prop
`prop` Defines model properties. Property name follows after `prop`.

```toml
[props.name]
type = "string"
```

### type
Type of property. Please use supported types.
```toml
[props.str]
type = "int"
```

Supported types
- boolean
- float
- int
- string
- uuid
- url
- email

### null
Modelgun supports nullable for non-array properties. Specify `null` option like below.
```toml
[props.name]
type = "string"
null = true
```

#### Referring another model
Use "ref:[MODEL_NAME]"

TODO: Let users to use file path to a model.

### validation
Depending on types of properties, modelgun auto generates validation code in model class.
For some types, modelgun uses [validator.js](https://www.npmjs.com/package/validator). Please add the npm package when you use types which requires it (e.g. uuid, email).
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

#### Custom validator for any types
You can use your custom validator in files in your project. For those case, use
`header` to import your functions or write directly in the generated model file.
Throw `InvalidPropertyError` defined in the auto-generated model file for error
cases.

```toml
header = "
import nameValidator from \"./path/to/file\"

function ageValidator (value: number) {
  if (value === 1000) {
    InvalidPropertyError(\"1000 years old is unbelievable.\")
  }
}
"

[props.name]
type = "string"
customValidator = "nameValidator"

[props.age]
type = "number"
customValidator = "ageValidator"
```
