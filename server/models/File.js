const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const File = sequelize.define("File", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    originalName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    path: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mimeType: {
        type: DataTypes.STRING,
    },
    size: {
        type: DataTypes.INTEGER,
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: "OTHER",
    },
    description: {
        type: DataTypes.STRING,
    },
});

// Relationships
User.hasMany(File, { foreignKey: "userId" });
File.belongsTo(User, { foreignKey: "userId" });

module.exports = File;
