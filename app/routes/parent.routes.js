const { authJwt } = require("../middleware");
const controller = require("../controllers/parent.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/parent/get/:id",
    [authJwt.verifyToken, authJwt.isParent],
    controller.getUser
  );

  app.get(
    "/api/parent/search",
    [authJwt.verifyToken],
    controller.searchUsers
  );
};