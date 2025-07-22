module.exports = (sequelize, Sequelize) => {
    const EventType = sequelize.define(
      "event",
      {
        EventID: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        EventName: {
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
  
    return EventType;
  };
  