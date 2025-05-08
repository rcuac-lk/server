module.exports = (sequelize, Sequelize) => {
    const AgeCategory = sequelize.define(
      "agecategory",
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        category: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      },
      {
        freezeTableName: true,
        timestamps: false
      }
    );
  
    return AgeCategory;
  };
  