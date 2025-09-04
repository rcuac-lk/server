module.exports = (sequelize, Sequelize) => {
    const Distance = sequelize.define(
      "distance",
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        length: {
          type: Sequelize.INTEGER,
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
  
    return Distance;
  };
  