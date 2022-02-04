var EC = require("elliptic").ec;
const crypto = require("crypto");
var ec = new EC("p256");

let pubKey = Buffer.from(
  "04165f8d4a634bb17f847e8d084a0fd09698ada5fadc91c0efa8d8c048b8028b7c5e3a12066c7ebc6ab9cda3785392d7cc4f49cc945e6f7787785ad7f49cba9449",
  "hex"
);
let key = ec.keyFromPublic(pubKey);

msg32 = Buffer.from("Kidmo");
const msgHash = crypto.createHash("sha256").update(msg32).digest();

let signature =
  "304502206452447c630799e209158d2eb215e39d05a7a732725cfe72f9ea5bce29cbe3aa022100edaa36d17ed3d0678c1f2c57e3bc9870fd6e0cab49bfcbfdf483e3a2e879dfe4";
console.log(key.verify(msgHash, signature));
