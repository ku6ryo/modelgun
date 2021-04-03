"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
function parseNumberDef(def) {
    let max = null;
    let min = null;
    let isInt = false;
    let candidates = null;
    if (typeof def.min === "number") {
        min = def.min;
    }
    if (typeof def.max === "number") {
        max = def.max;
    }
    isInt = def.type === constants_1.NumberType.INTERGER;
    if (Array.isArray(def.candidates)) {
        candidates = def.candidates;
        candidates.forEach((c) => {
            if (typeof c !== "number") {
                throw new Error("a candidate of a number property is not number");
            }
        });
    }
    return {
        max,
        min,
        isInt,
        hasCandidates: !!candidates,
        candidates,
    };
}
exports.default = parseNumberDef;
