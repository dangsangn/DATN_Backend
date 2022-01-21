const router = require("express").Router();
const { verifyToken, verifyTokenAndAuthorization } = require("../middleware/auth");
const RoomFavorite = require("../models/RoomsFavorite");

//add a room in roomfavotite list
router.get("/:idRoom", verifyToken, async (req, res) => {
  try {
    let newRoomFavorite = await RoomFavorite.findOne({ idUser: req.idUser });
    if (!newRoomFavorite) {
      newRoomFavorite = new RoomFavorite({
        idUser: req.idUser,
        listRooms: [req.params.idRoom],
      });
      await newRoomFavorite.save();
    } else {
      const newList = newRoomFavorite.listRooms;
      newList.unshift(req.params.idRoom);
      newRoomFavorite = await RoomFavorite.findOneAndUpdate(
        { idUser: req.idUser },
        { $set: { listRooms: [...new Set(newList)] } },
        { new: true }
      );
    }
    res.status(202).json({ data: newRoomFavorite });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
