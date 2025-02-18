const { authJwt } = require("../middleware");
const controller = require("../controllers/manager.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/manager/notApproved",
    [authJwt.verifyToken, authJwt.isManager],
    controller.notApprovedUsers
  );

  app.get(
    "/api/manager/approved",
    [authJwt.verifyToken, authJwt.isManager],
    controller.approvedUsers
  );

  app.get(
    "/api/manager/getAll",
    [authJwt.verifyToken, authJwt.isManager],
    controller.getAllUsers
  );

  app.get(
    "/api/manager/get/:id",
    [authJwt.verifyToken, authJwt.isManager],
    controller.getUser
  );

  app.put(
    "/api/manager/approve/:id",
    [authJwt.verifyToken, authJwt.isManager],
    controller.approveUser
  );

  app.get(
    "/api/manager/search",
    [authJwt.verifyToken],
    controller.searchUsers
  );

  app.put(
    "/api/manager/deactivate/:id",
    [authJwt.verifyToken, authJwt.isManager],
    controller.deactivateUser
  );
};