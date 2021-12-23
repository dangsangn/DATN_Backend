const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization") && req.header("Authorization").split(" ")[1];
  if (!token) {
    return res.status(400).json("token is empty");
  } else {
    try {
      const decode = jwt.verify(token, process.env.ACCESS_TOKEN);
      const { isAdmin, idUser } = decode;
      req.idUser = idUser;
      req.isAdmin = isAdmin;
      next();
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.idUser === req.params.idUser || req.isAdmin) {
      next();
    } else {
      res.status(400).json("You can not do this");
    }
  });
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.isAdmin) {
      next();
    } else {
      res.status(400).json("You is not admin");
    }
  });
};

module.exports = { verifyToken, verifyTokenAndAuthorization, verifyAdmin };
