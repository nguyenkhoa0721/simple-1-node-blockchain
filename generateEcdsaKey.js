var EC = require("elliptic").ec;
const crypto = require("crypto");
var ec = new EC("p256");

let pubKey = Buffer.from(
  "04b6e5a7f376b1f0c07251d6e9250c5e35ab43543c795ed89906b3ccbd8f2a3f75f9494daa4610ec34de458922fa2f3b1d03b94e3379ad752d190357f88e8256f2",
  "hex"
);
let key = ec.keyFromPublic(pubKey);

msg32 = Buffer.from("Kidmo");
const msgHash = crypto.createHash("sha256").update(msg32).digest();

console.log(msgHash)

let signature =
  "3045022100b7b58ceabbc1d6d0a8c973ff31440026528a8f53cabd6eaddbefe35593676493022056f970683e11620e8f11eb88a17dcdf3ce5d380911028a22d72b3db9159730d2";
console.log(key.verify(msgHash, signature));
