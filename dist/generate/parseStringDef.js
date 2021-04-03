"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
function parseStringDef(def) {
    let isUuid = false;
    let isEmail = false;
    let regex = null;
    let maxLength = null;
    let minLength = null;
    let candidates = null;
    if (typeof def.maxLength === "number"
        && def.maxLength > 0) {
        maxLength = def.maxLength;
    }
    if (typeof def.minLength === "number"
        && def.minLength >= 0) {
        minLength = def.minLength;
    }
    if (typeof def.regex === "string") {
        regex = def.regex;
    }
    isUuid = def.type === constants_1.StringType.UUID;
    isEmail = def.type === constants_1.StringType.EMAIL;
    if (Array.isArray(def.candidates)) {
        candidates = def.candidates;
        candidates.forEach((c) => {
            if (typeof c !== "string") {
                throw new Error("a candidate of a number property is not number");
            }
        });
    }
    return {
        isUuid,
        isEmail,
        regex,
        maxLength,
        minLength,
        hasCandidates: !!candidates,
        candidates,
    };
}
exports.default = parseStringDef;
