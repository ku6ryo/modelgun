"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NUMBER_TYPES = exports.STRING_TYPES = exports.BooleanType = exports.NumberType = exports.StringType = exports.PrimitiveType = void 0;
var PrimitiveType;
(function (PrimitiveType) {
    PrimitiveType["STRING"] = "string";
    PrimitiveType["NUMBER"] = "number";
    PrimitiveType["BOOLEAN"] = "boolean";
})(PrimitiveType = exports.PrimitiveType || (exports.PrimitiveType = {}));
var StringType;
(function (StringType) {
    StringType["STRING"] = "string";
    StringType["UUID"] = "uuid";
    StringType["EMAIL"] = "email";
    StringType["URL"] = "url";
})(StringType = exports.StringType || (exports.StringType = {}));
var NumberType;
(function (NumberType) {
    NumberType["INTERGER"] = "int";
    NumberType["FLOAT"] = "float";
})(NumberType = exports.NumberType || (exports.NumberType = {}));
var BooleanType;
(function (BooleanType) {
    BooleanType["BOOLEAN"] = "boolean";
})(BooleanType = exports.BooleanType || (exports.BooleanType = {}));
exports.STRING_TYPES = [
    StringType.STRING,
    StringType.EMAIL,
    StringType.URL,
    StringType.UUID,
];
exports.NUMBER_TYPES = [
    NumberType.INTERGER,
    NumberType.FLOAT,
];
