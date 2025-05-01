"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
fs_1.default.writeFile('./output.txt', 'Hello World!', (err) => {
    if (err)
        throw err;
    console.log('The file has been saved!');
});
//# sourceMappingURL=index.js.map