module.exports = (sequelize, Sequelize) => {
    const Attendance = sequelize.define(
      "attendance",
      {
        AttendanceID: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        StudentID: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        AttendanceDate: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        SessionID: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        Present: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        MarkedBy: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        MarkedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      },
      {
        freezeTableName: true,
        timestamps: false,
      }
    );
  
    return Attendance;
  };
  