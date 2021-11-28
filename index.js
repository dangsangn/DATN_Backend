const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieSession = require("cookie-session");
const passport = require("passport");
const fs = require("fs");

const passportSetup = require("./passport");
const authRouter = require("./routers/author");
const userRouter = require("./routers/user");
const roomRouter = require("./routers/room");
const upload = require("./multer");
const cloudinary = require("./cloudinary");

const app = express();
dotenv.config();
const corsConfig = {
  credentials: true,
  origin: true,
};
app.use(cors(corsConfig));
app.use(express.json());

//login width google and facabook
app.use(cookieSession({ name: "session", keys: ["dangsang"], maxAge: 24 * 60 * 60 * 100 }));

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

//connect db
mongoose
  .connect(process.env.URL_MONGODB)
  .then(() => console.log("connect to db success"))
  .catch((err) => console.log("error", err));

//use router
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/room", roomRouter);

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
app.listen(PORT, () => {
  console.log("listening on port ", PORT);
});
