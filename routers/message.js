const router = require("express").Router();
const { verifyToken, verifyTokenAndAuthorization } = require("../middleware/auth");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

//add a messs
router.post("/:conversationId", verifyToken, async (req, res) => {
  const message = new Message({
    conversationId: req.params.conversationId,
    sender: req.idUser,
    content: req.body.content,
  });
  try {
    const newMessage = await message.save();
    res.json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json(error);
  }
});

//get message of a conversation
router.get("/:conversationId", verifyToken, async (req, res) => {
  try {
    const length = await Message.find({
      conversationId: req.params.conversationId,
    }).count();
    let messages;
    if (length > 30) {
      messages = await Message.find({
        conversationId: req.params.conversationId,
      }).skip(length - 20);
    } else {
      messages = await Message.find({
        conversationId: req.params.conversationId,
      });
    }
    res.json({ success: true, messages });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
