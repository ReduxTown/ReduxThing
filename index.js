#!/usr/bin/env node

console.log("ReduxThing Terminal Script is running!");

const args = process.argv.slice(2);
console.log("Arguments:", args);

if (args.length === 0) {
  console.log("No arguments passed. Try: node index.js hello");
} else {
  console.log("You ran:", args.join(" "));
}
