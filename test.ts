import { validateFileBuffer } from "./src";
import * as fs from "fs";

const buffer = fs.readFileSync("samples/download.jpeg");
const result = validateFileBuffer(buffer, "download.png");

console.log(result);
/*
{
  fileName: "test.jpg",
  extension: "jpg",
  actualType: "png",
  isValid: false
}
*/
