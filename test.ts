import { validateFileBuffer } from "./src";
import * as fs from "fs";

(async ()=> {
  const buffer = fs.readFileSync("samples/download.jpeg");
  const result1 = await validateFileBuffer(buffer, "download.jpeg");
  const result2 = await validateFileBuffer(buffer, "download.png");
  
  console.log([result1, result2]);
})()
/*
{
  fileName: "test.jpg",
  extension: "jpg",
  actualType: "png",
  isValid: false
}
*/
