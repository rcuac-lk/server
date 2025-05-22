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
    "/api/users/approved",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.approvedUsers
  );

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

  app.get(
    "/api/users/search",
    [authJwt.verifyToken],
    controller.searchUsers
  );

  app.put(
    "/api/users/deactivate/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deactivateUser
  );

  app.get(
    "/api/users/ageGroups",
    [authJwt.verifyToken, authJwt.allowRoles(["Admin", "Manager", "Coach"])],
    controller.getAgeGroups
  );

  app.get(
    "/api/users/getSessionData",
    [authJwt.verifyToken, authJwt.allowRoles(["Admin", "Manager", "Coach"])],
    controller.getSessionData
  );

  app.get(
    "/api/users/getEventTypes",
    [authJwt.verifyToken, authJwt.allowRoles(["Admin", "Manager", "Coach"])],
    controller.getEventTypes
  );

  app.get(
    "/api/users/getEventLengths",
    [authJwt.verifyToken, authJwt.allowRoles(["Admin", "Manager", "Coach"])],
    controller.getEventLengths
  );

  app.get(
    "/api/users/getAttendancedata",
    [authJwt.verifyToken, authJwt.allowRoles(["Admin", "Manager", "Coach"])],
    controller.getAttendancedata
  )

  app.post(
    "/api/users/markAttendance",
    [authJwt.verifyToken, authJwt.allowRoles(["Admin", "Manager", "Coach"])],
    controller.markAttendance
  )  

  app.post(
    "/api/users/markTiming",
    [authJwt.verifyToken, authJwt.allowRoles(["Admin", "Manager", "Coach"])],
    controller.markTiming
  )
};