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
        Active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        freezeTableName: true,
        timestamps: false,
      }
    );
  
    return Session;
  };
  