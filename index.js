const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();
dotenv.config();
app.use(cors());

console.log(process.env.URL_MONGODB);
mongoose
  .connect(process.env.URL_MONGODB)
  .then(() => console.log("connect to db success"))
  .catch((err) => console.log("error", err));
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => {
  console.log("listening on port ", PORT);
});
