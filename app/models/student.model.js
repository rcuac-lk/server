module.exports = (sequelize, Sequelize) => {
  const Student = sequelize.define("student", {
    StudentID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    FirstName: {
      type: Sequelize.STRING(50)
    },
    LastName: {
      type: Sequelize.STRING(50)
    },
    Active: {
      type: Sequelize.BOOLEAN
    },
    Approved: {
      type: Sequelize.BOOLEAN
    },
    DOB: {
      type: Sequelize.DATE
    },
    ParentID: {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',
        key: 'UserID'
      }
    }
  });

  return Student;
};