const { authJwt } = require("../middleware");
const controller = require("../controllers/coach.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/coach/getAll",
    [authJwt.verifyToken, authJwt.isCoach],
    controller.getAllUsers
  );

  app.get(
    "/api/coach/get/:id",
    [authJwt.verifyToken, authJwt.isCoach],
    controller.getUser
  );

  app.get(
    "/api/coach/search",
    [authJwt.verifyToken],
    controller.searchUsers
  );

  app.get(
    "/api/coach/notApproved",
    [authJwt.verifyToken, authJwt.isCoach],
    controller.notApprovedUsers
  );
  
  app.get(
    "/api/coach/approved",
    [authJwt.verifyToken, authJwt.isCoach],
    controller.approvedUsers
  );
  
  app.get(
    "/api/coach/getAll",
    [authJwt.verifyToken, authJwt.isCoach],
    controller.getAllUsers
  );

  app.put(
    "/api/coach/approve/:id",
    [authJwt.verifyToken, authJwt.isCoach],
    controller.approveUser
  );
    
  app.put(
    "/api/coach/deactivate/:id",
    [authJwt.verifyToken, authJwt.isCoach],
    controller.deactivateUser
  );
};