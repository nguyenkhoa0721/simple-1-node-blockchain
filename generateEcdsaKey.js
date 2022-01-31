var crypto = require("crypto");
var eccrypto = require("eccrypto");

var privateKey = eccrypto.generatePrivate();
// privateKey = Buffer.from("7JTubc2+M878YQlEBEIXT2Fa3tUuNHX8nK3QgWFObl8", "base64");
publicKey = Buffer.from(eccrypto.getPublic(privateKey).toString("base64"), "base64");
console.log(privateKey.toString("base64"));
console.log(publicKey.toString("base64"));

var str = "c1bd5e9764ba51f6cb0718d78f053e8e39943301028fb4666a488dfc1e982442";

var msg = crypto.createHash("sha256").update(str).digest();

eccrypto.sign(privateKey, msg).then(function (sig) {
  console.log("Signature in DER format:", sig.toString("base64"));
  eccrypto
    .verify(publicKey, msg, sig)
    .then(function () {
      console.log("Signature is OK");
    })
    .catch(function () {
      console.log("Signature is BAD");
    });
});
