const Messages = require("../models/messageModel");
// crypto module
const crypto = require("crypto");

const algorithm = "aes-256-cbc";
// generate 16 bytes of random data
const initVector = crypto.randomBytes(16);

// secret key generate 32 bytes of random data
const Securitykey = crypto.randomBytes(32);

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      const decipher = crypto.createDecipheriv(
        algorithm,
        Securitykey,
        initVector
      );

      let decryptedData = decipher.update(smg.message.text, "hex", "utf-8");

      decryptedData += decipher.final("utf8");

      return {
        fromSelf: msg.sender.toString() === from,
        message: decryptedData,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    //encryption

    // the cipher function
    const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);

    const { from, to, message } = req.body;
    let encryptedData = cipher.update(message, "utf-8", "hex");

    encryptedData += cipher.final("hex");
    const data = await Messages.create({
      message: { text: encryptedData },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};
