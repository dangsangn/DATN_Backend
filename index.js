const express = require("express"),
  http = require("http"),
  app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieSession = require("cookie-session");
const passport = require("passport");
const fs = require("fs");

const authRouter = require("./routers/author");
const userRouter = require("./routers/user");
const roomRouter = require("./routers/room");
const roomFavoriteRouter = require("./routers/roomFavorite");
const provinceRouter = require("./routers/province");
const conversationRouter = require("./routers/conversation");
const messageRouter = require("./routers/message");
const orderRouter = require("./routers/order");
const upload = require("./multer");
const cloudinary = require("./cloudinary");
dotenv.config();
app.use("/uploads", express.static("uploads"));
const corsConfig = {
  origin: "http://localhost:3000",
  methods: "GET,POST,PUT,DELETE,PATCH",
  credentials: true,
  // origin: true,
};
app.use(cors(corsConfig));
app.use(express.json());

//login width google and facabook
app.use(cookieSession({ name: "session", keys: ["dangsang"], maxAge: 24 * 60 * 60 * 1000 }));

app.use(passport.initialize());
app.use(passport.session());

//connect db
mongoose
  .connect(process.env.URL_MONGODB)
  .then(() => console.log("connect to db success"))
  .catch((err) => console.log("error", err));

//use router
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/room", roomRouter);
app.use("/api/room-favorite", roomFavoriteRouter);
app.use("/api/provinces", provinceRouter);
app.use("/api/conversation", conversationRouter);
app.use("/api/message", messageRouter);
app.use("/api/order", orderRouter);

app.use("/api/upload-images", upload.array("image"), async (req, res) => {
  const uploader = async (path) => await cloudinary.uploads(path, "Images");
  if (req.method === "POST") {
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }
    res.status(200).json({ message: "Success", data: urls });
  } else {
    res.status(405).json({
      err: `${req.method} method not allowed`,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, function () {
  console.log("Server running at ", PORT);
});
