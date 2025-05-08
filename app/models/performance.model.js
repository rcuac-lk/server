module.exports = (sequelize, Sequelize) => {
    const Performance = sequelize.define(
      "performance",
      {
        PerformanceID: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        StudentID: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        EventID: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        PerformanceDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        DistanceID: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        SessionID: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        Time: {
          type: Sequelize.TIME,
          allowNull: false,
        },
        RecordedBy: {
          type: Sequelize.INTEGER,
          allowNull: false,
        }
      },
      {
        freezeTableName: true,
        timestamps: false,
      }
    );
  
    return Performance;
  };
  