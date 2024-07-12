const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    process.env.POSTGRES_DB,
    process.env.POSTGRES_USER,
    process.env.POSTGRES_PASSWORD,
    {
        host: process.env.HOST,
        dialect: process.env.DIALECT
    });

const User = require('./User')(sequelize, DataTypes);
const Workout = require('./Workout')(sequelize, DataTypes);
const Attendance = require('./Attendance')(sequelize, DataTypes);

User.hasMany(Workout, { as: 'workouts', foreignKey: 'userId' });
Workout.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Attendance, { as: 'attendances', foreignKey: 'userId' });
Attendance.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    sequelize,
    User,
    Workout,
    Attendance,
};
