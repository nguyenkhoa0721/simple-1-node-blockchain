var crypto = require("crypto");
var eccrypto = require("eccrypto");

// var privateKey = eccrypto.generatePrivate();
privateKey = Buffer.from("5e3b4f4c3ff3f4a2c66556d4bcd7554f4f8f87f5dc3857f36bf83e0e1fdead84", "hex");
publicKey = eccrypto.getPublic(privateKey);
console.log(privateKey.toString("hex"));
console.log(publicKey.toString("hex"));

var str = "5e3b4f4c3ff3f4a2c66556d4bcd7554f4f8f87f5dc3857f36bf83e0e1fdead84";

var msg = crypto.createHash("sha256").update(str).digest();

eccrypto.sign(privateKey, msg).then(function (sig) {
  console.log("Signature in DER format:", sig.toString("hex"));
  eccrypto
    .verify(publicKey, msg, sig)
    .then(function () {
      console.log("Signature is OK");
    })
    .catch(function () {
      console.log("Signature is BAD");
    });
});
