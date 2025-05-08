module.exports = (sequelize, Sequelize) => {
    const Session = sequelize.define(
      "sessions",
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        sessionName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      },
      {
        freezeTableName: true,
        timestamps: false,
      }
    );
  
    return Session;
  };
  