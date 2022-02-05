var EC = require("elliptic").ec;
const crypto = require("crypto");
var ec = new EC("p256");

let pubKey = Buffer.from(
  "04165f8d4a634bb17f847e8d084a0fd09698ada5fadc91c0efa8d8c048b8028b7c5e3a12066c7ebc6ab9cda3785392d7cc4f49cc945e6f7787785ad7f49cba9449",
  "hex"
);
let key = ec.keyFromPublic(pubKey);

msg32 = Buffer.from("f55a612e08cdb3b64a813316bbb1a19005dec37acd466614fe52fb5877d3fd3c");
const msgHash = crypto.createHash("sha256").update(msg32).digest();

let signature =
  "3044022008a210348d4d3812664bfae9335df566132e82ce624b9a9afcad6ee578bc80c80220082823916afed53099cc489be67c1c43ab4e9272630f20ddd2e922831339bc15";
console.log(key.verify(msgHash, signature));
