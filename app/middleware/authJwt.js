const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

const { TokenExpiredError } = jwt;

// verifyToken = (req, res, next) => {
//   let token = req.session.token;

//   if (!token) {
//     return res.status(403).send({
//       message: "No token provided!",
//     });
//   }

//   jwt.verify(token,
//              config.secret,
//              (err, decoded) => {
//               if (err) {
//                 return res.status(401).send({
//                   message: "Unauthorized!",
//                 });
//               }
//               req.userId = decoded.id;
//               next();
//              });
// };

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return catchError(err, res);
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    console.log(user);
    const role = user.dataValues.Role;

    // for (let i = 0; i < roles.length; i++) {
      if (role === "Admin") {
        return next();
      }
    // }

    return res.status(403).send({
      message: "Require Admin Role!",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate User role!",
    });
  }
};

isCoach = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const role = user.dataValues.Role;

    // for (let i = 0; i < roles.length; i++) {
      if (role === "Coach") {
        return next();
      }
    // }

    return res.status(403).send({
      message: "Require Coach Role!",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate User role!",
    });
  }
};

isManager = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const role = user.dataValues.Role;

    // for (let i = 0; i < roles.length; i++) {
      if (role === "Manager") {
        return next();
      }
    // }

    return res.status(403).send({
      message: "Require Manager Role!",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate User role!",
    });
  }
};

isParent = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const role = user.dataValues.Role;

    // for (let i = 0; i < roles.length; i++) {
      if (role === "Parent") {
        return next();
      }
    // }

    return res.status(403).send({
      message: "Require Parent Role!",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to validate User role!",
    });
  }
};

// isModerator = async (req, res, next) => {
//   try {
//     const user = await User.findByPk(req.userId);
//     const roles = await user.getRoles();

//     for (let i = 0; i < roles.length; i++) {
//       if (roles[i].name === "moderator") {
//         return next();
//       }
//     }

//     return res.status(403).send({
//       message: "Require Moderator Role!",
//     });
//   } catch (error) {
//     return res.status(500).send({
//       message: "Unable to validate Moderator role!",
//     });
//   }
// };

// isModeratorOrAdmin = async (req, res, next) => {
//   try {
//     const user = await User.findByPk(req.userId);
//     const roles = await user.getRoles();

//     for (let i = 0; i < roles.length; i++) {
//       if (roles[i].name === "moderator") {
//         return next();
//       }

//       if (roles[i].name === "admin") {
//         return next();
//       }
//     }

//     return res.status(403).send({
//       message: "Require Moderator or Admin Role!",
//     });
//   } catch (error) {
//     return res.status(500).send({
//       message: "Unable to validate Moderator or Admin role!",
//     });
//   }
// };

catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
  }

  return res.sendStatus(401).send({ message: "Unauthorized!" });
}

const authJwt = {
  verifyToken,
  catchError,
  isAdmin,
  isCoach,
  isManager,
  isParent
};
module.exports = authJwt;