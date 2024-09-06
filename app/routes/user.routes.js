const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  // app.get("/api/test/all", controller.allAccess);

  // app.get(
  //   "/api/test/user",
  //   [authJwt.verifyToken],
  //   controller.userBoard
  // );

  // app.get(
  //   "/api/test/mod",
  //   [authJwt.verifyToken, authJwt.isModerator],
  //   controller.moderatorBoard
  // );

  // app.get(
  //   "/api/test/admin",
  //   [authJwt.verifyToken, authJwt.isAdmin],
  //   controller.adminBoard
  // );

  app.get(
    "/api/users/notApproved",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.notApprovedUsers
  );

  app.get(
    "api/users/approved",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.approvedUsers
  )

  app.get(
    "/api/users/getAll",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getAllUsers
  );

  app.get(
    "/api/users/get/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getUser
  );

  app.put(
    "/api/users/approve/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.approveUser
  );

  app.put(
    "/api/users/updateAdmin/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateAdmin
  );

  app.put(
    "/api/users/updateProfile/:id",
    [authJwt.verifyToken],
    controller.updateProfile
  );
};
