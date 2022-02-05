var EC = require("elliptic").ec;
const crypto = require("crypto");
var ec = new EC("p256");

let privKey = Buffer.from(
  "9acaec44e7b4d0e3bc992581d2ce127c7c44ef52c2442a7743cbe7c83271afd9",
  "hex"
);
let key = ec.keyFromPrivate(privKey);

var pubPoint = key.getPublic();
var pubKey = pubPoint.encode("hex");
console.log("Public key: " + pubKey);

msg32 = Buffer.from("f55a612e08cdb3b64a813316bbb1a19005dec37acd466614fe52fb5877d3fd3c");
const msgHash = crypto.createHash("sha256").update(msg32).digest();

let signature = key.sign(msgHash);

console.log("Signature: " + Buffer.from(signature.toDER()).toString("hex"));
