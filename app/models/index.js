const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.refreshToken = require("../models/refreshToken.model.js")(sequelize, Sequelize);
db.student = require("../models/student.model.js")(sequelize, Sequelize);

db.user.belongsToMany(db.role, {
  through: "user_roles",
  as: "roles",
  foreignKey: "userId"
});

db.role.belongsToMany(db.user, {
  through: "user_roles",
  as: "users",
  foreignKey: "roleId"
});

db.refreshToken.belongsTo(db.user, {
  foreignKey: 'userId', targetKey: 'UserID'
});

db.user.hasOne(db.refreshToken, {
  foreignKey: 'userId', sourceKey: 'UserID'
});

db.user.hasMany(db.student, {
  foreignKey: 'ParentID',
  sourceKey: 'UserID'
});

db.student.belongsTo(db.user, {
  foreignKey: 'ParentID',
  targetKey: 'UserID'
});

module.exports = db;