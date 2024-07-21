module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    UserID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Username: {
      type: Sequelize.STRING(50),
      unique: true
    },
    Password: {
      type: Sequelize.STRING(100)
    },
    Role: {
      type: Sequelize.ENUM('Admin', 'Coach', 'Manager', 'Parent', 'Child')
    },
    FirstName: {
      type: Sequelize.STRING(50)
    },
    LastName: {
      type: Sequelize.STRING(50)
    },
    Email: {
      type: Sequelize.STRING(100)
    },
    ParentID: {
      type: Sequelize.INTEGER,
      // references: {
      //   model: 'Parent', // Assumes 'Parent' table is defined
      //   key: 'ParentID'
      // }
    }
  });

  return User;
};
