const express = require("express"),
  http = require("http"),
  app = express(),
  server = http.createServer(app);
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
const provinceRouter = require("./routers/province");
const upload = require("./multer");
const cloudinary = require("./cloudinary");

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
app.use("/api/provinces", provinceRouter);

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

app.listen(PORT,function () {
  console.log("Server running at ", PORT);
});

// server.listen(8080, "127.0.0.1", function () {
//   server.close(function () {
//     server.listen(8080, "0.0.0.0");
//   });
// });

// var http = require("http");
// var parse = require("url").parse;
// var handleRequest = function (req, res) {
//   const defaultValue = "world";
//   var query = parse(req.url, true).query;
//   var name = query.name || defaultValue;

//   res.writeHead(200, { "Content-Type": "text/plain" });
//   res.end(`Hello ${name}\n`);
// };

// http.createServer(handleRequest).listen(8080, "0.0.0.0");

// console.log("Server running at http://0.0.0.0:8080/");
