const router = require("express").Router();
const Conversation = require("../models/Conversation");
const { verifyToken, verifyTokenAndAuthorization } = require("../middleware/auth");

//create a conversation
router.post("/", verifyToken, async (req, res) => {
  const conversationExist = await Conversation.findOne({
    members: { $all: [req.idUser, req.body.idReceiver] },
  });
  if (conversationExist) {
    return res.status(400).json({ success: false, message: "Conversation is existed." });
  } else {
    const conversation = new Conversation({ members: [req.idUser, req.body.idReceiver] });
    try {
      const newConversation = await conversation.save();
      res.status(200).json({ success: true, conversation: newConversation });
    } catch (error) {
      return res.status(400).json("server error: ", error);
    }
  }
});

// get conv includes two userId
router.get("/:secondUserId", verifyToken, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.idUser, req.params.secondUserId] },
    });
    if (!conversation) {
      return res.status(200).json({ message: "notfound" });
    }
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get list conversation of user
router.get("/", verifyToken, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: { $all: [req.idUser] },
    });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json(err);
  }
});

module.exports = router;

