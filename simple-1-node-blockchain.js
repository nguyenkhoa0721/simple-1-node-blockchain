const crypto = require("crypto"),
  SHA256 = (message) => crypto.createHash("sha256").update(message).digest("hex");
var EC = require("elliptic").ec;
const uuid = require("uuid");
const nodePersist = require("node-persist");
const express = require("express");
const { ErrorReporting } = require("@google-cloud/error-reporting");

var ec = new EC("p256");

const app = express();
const errors = new ErrorReporting({
  reportMode: "always",
});

app.use(errors.express);
app.use(express.json());
const port = 3000;

class Ticket {
  constructor(name, description, location, category, start, end) {
    this.ticketId = uuid.v4();
    this.name = name;
    this.description = description;
    this.location = location;
    this.category = category;
    this.start = start;
    this.end = end;
  }
}

class UnspentTxOut {
  constructor(txid, address, data) {
    this.txid = txid;
    this.address = address;
    this.data = Object.freeze(data);
  }
}

class Transaction {
  constructor(txOutId, address, signature, data = {}) {
    this.txOutId = txOutId;
    if (this.txOutId == -1) {
      this.data = data;
      this.signature = -1;
    } else {
      this.signature = signature;
    }
    this.address = address;
    this.time = Date.now().toString();
    this.txid = SHA256(this.time + this.address + JSON.stringify(this.data));
  }

  verifySig(publicKey, sig, msg) {
    let pubKey = Buffer.from(publicKey, "hex");
    let key = ec.keyFromPublic(pubKey);

    let msgBin = Buffer.from(msg);
    let msgHash = crypto.createHash("sha256").update(msgBin).digest();

    return key.verify(msgHash, sig);
  }

  async vaild() {
    let isVerified;
    if (this.txOutId == "-1") {
      return { index: -1 };
    }

    let aUnspentIndex = blockchain.utxo.findIndex((utxo) => utxo.txid == this.txOutId);
    let aUnspent = blockchain.utxo[aUnspentIndex];
    if (!aUnspent) {
      return { error: "Cant find txOutId" };
    }
    this.data = Object.freeze(aUnspent.data);

    isVerified = await this.verifySig(aUnspent.address, this.signature, this.txOutId);

    if (!isVerified) {
      return { error: "Wrong signature" };
    }

    return { index: aUnspentIndex };
  }
}

class Block {
  constructor(data = {}) {
    this.timestamp = Date.now().toString();
    this.data = Object.freeze(data);
    this.hash = this.getHash();
    this.prevHash = "";
    this.nonce = 0;
  }

  getHash() {
    return SHA256(this.prevHash + this.timestamp + JSON.stringify(this.data) + this.nonce);
  }

  mine(difficulty) {
    while (!this.hash.startsWith(Array(difficulty + 1).join("0"))) {
      this.nonce++;
      this.hash = this.getHash();
    }
  }
}

class Blockchain {
  constructor() {
    this.difficulty = 4;
    this.chain = [];
    this.utxo = [];
  }

  async init() {
    this.storage = nodePersist.create({
      dir: __dirname + "/storage/blockchain",
    });

    await this.storage.init();
    this.chain = await this.storage.getItem("chain");
    this.utxo = await this.storage.getItem("utxo");

    if (!this.chain) this.chain = [];
    if (!this.utxo) this.utxo = [];

    if (this.chain.length == 0) {
      let genesisBlock = new Block(); // initial block
      this.addBlock(genesisBlock);
    }
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  async addBlock(block) {
    if (this.chain.length == 0) {
      block.prevHash = "0000000000000000";
    } else block.prevHash = await this.getLastBlock().hash;

    block.hash = block.getHash();
    await block.mine(this.difficulty);

    this.chain.push(Object.freeze(block));
    await this.storage.setItem("chain", this.chain);

    return block;
  }

  async addUTXO(item) {
    this.utxo.push(Object.freeze(item));
    await this.storage.setItem("utxo", this.utxo);
  }

  async removeUTXO(idx) {
    this.utxo.splice(idx, 1);
    await this.storage.setItem("utxo", this.utxo);
  }

  isValid(blockchain = this) {
    for (let i = 1; i < blockchain.chain.length; i++) {
      const currentBlock = blockchain.chain[i];
      const prevBlock = blockchain.chain[i - 1];

      // Check validation
      if (
        currentBlock.hash !== currentBlock.getHash() ||
        prevBlock.hash !== currentBlock.prevHash
      ) {
        return false;
      }
    }

    return true;
  }
}

let blockchain = new Blockchain();
blockchain.init();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/transaction", async (req, res) => {
  let transaction = new Transaction(req.body.txOutId, req.body.address, req.body.signature);
  let validRes = await transaction.vaild();
  if (validRes.error) {
    return res.status(500).send(validRes);
  }
  let block = await blockchain.addBlock(new Block(transaction));
  blockchain.removeUTXO(validRes.index);
  blockchain.addUTXO(new UnspentTxOut(transaction.txid, transaction.address, transaction.data));
  return res.status(200).send(block);
});

app.post("/create", async (req, res) => {
  req.body.txOutId = "-1";
  let ticket = new Ticket(
    req.body.ticket.name,
    req.body.ticket.description,
    req.body.ticket.location,
    req.body.ticket.category,
    req.body.ticket.start,
    req.body.ticket.end
  );
  let transaction = new Transaction(req.body.txOutId, req.body.address, req.body.signature, ticket);
  let validRes = transaction.vaild();
  if (validRes.error) {
    return res.status(500).send(validRes);
  }
  let block = await blockchain.addBlock(new Block(transaction));
  blockchain.addUTXO(new UnspentTxOut(transaction.txid, transaction.address, transaction.data));
  return res.status(200).send(block);
});

app.get("/uxto", async (req, res) => {
  if (req.query.pubkey) {
    const result = blockchain.utxo.filter((item) => item.address == req.query.pubkey);
    return res.status(200).send(result);
  } else {
    return res.status(200).send(blockchain.utxo);
  }
});

app.get("/history", async (req, res) => {
  if (req.query.ticketId) {
    const result = blockchain.chain.filter((item) => {
      return item.data.data && item.data.data.ticketId == req.query.ticketId;
    });
    return res.status(200).send(result);
  } else {
    return res.status(200).send(blockchain.chain);
  }
});

app.get("/error", (req, res, next) => {
  res.send("Something broke!");
  next(new Error("Custom error message"));
});

app.get("/exception", () => {
  JSON.parse('{"malformedJson": true');
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  console.log("Press Ctrl+C to quit.");
});
