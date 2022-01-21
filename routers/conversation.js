const router = require("express").Router();
const Conversation = require("../models/Conversation");
const { verifyToken, verifyTokenAndAuthorization } = require("../middleware/auth");

//create a conversation
router.post("/", verifyToken, async (req, res) => {
  const conversation = new Conversation({ members: [req.idUser, req.body.idReceiver] });
  try {
    const newConversation = await conversation.save();
    res.status(200).json({ success: true, conversation: newConversation });
  } catch (error) {
    return res.status(400).json("server error: ", error);
  }
});

//get a conversation
router.get("/:idConversation", verifyToken, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.idConversation });
    if (conversation) {
      res.status(200).json({ success: true, conversation });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

module.exports = router;

