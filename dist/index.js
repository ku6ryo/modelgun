"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generate_1 = __importDefault(require("./generate"));
var Command;
(function (Command) {
    Command["GENERATE"] = "gen";
})(Command || (Command = {}));
function main() {
    const command = process.argv[2];
    switch (command) {
        case Command.GENERATE:
            generateInterface(process.argv.slice(3));
            break;
        default:
            break;
    }
}
exports.default = main;
/**
 * Generate command interface.
 */
function generateInterface(args) {
    console.log("Generating models");
    try {
        generate_1.default({
            targetDir: args[0]
        });
    }
    catch (e) {
        console.log("Failed with Error");
        console.log(e);
    }
}
