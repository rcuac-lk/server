module.exports = (sequelize, Sequelize) => {
    const SessionProperties = sequelize.define(
      "session_properties",
      {
        uid: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        session_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        prop_length: {
          type: Sequelize.INTEGER,
          allowNull:true,
        },
        prop_style: {
          type: Sequelize.INTEGER,
          allowNull:true,
        },
        prop_date: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        Active: {
            type: Sequelize.INTEGER,
            allowNull: false,
        }
      },
      {
        timestamps: false
      }
    );
  
    return SessionProperties;
  };