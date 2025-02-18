const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');

const app = express();

// app.use(cors());
/* for Angular Client (withCredentials) */
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "https://dev.rcuac.lk", "https://rcuac.lk"],
  })
);

// parse requests of content-type - application/json
app.use(express.json());

// Swagger
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "rcuac-session",
    keys: ["COOKIE_SECRET"], // should use as secret environment variable
    httpOnly: true,
    sameSite: 'strict'
  })
);

// database
const db = require("./app/models");

db.sequelize.sync();
// force: true will drop the table if it already exists
// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initial();
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to rcuac application." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/coach.routes")(app);
require("./app/routes/manager.routes")(app);
require("./app/routes/parent.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

let Role = db.role;

function initial() {
  Role.create({
    id: 1,
    name: "Guest",
  });

  Role.create({
    id: 2,
    name: "Admin",
  });

  Role.create({
    id: 3,
    name: "Parent",
  });

  Role.create({
    id: 4,
    name: "Child",
  });

  Role.create({
    id: 5,
    name: "Coach",
  });

  Role.create({
    id: 6,
    name: "Manager",
  });
}
