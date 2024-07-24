const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

const User = require('./User')(sequelize, DataTypes);
const Workout = require('./Workout')(sequelize, DataTypes);
const Attendance = require('./Attendance')(sequelize, DataTypes);

User.hasMany(Workout, { as: 'workouts', foreignKey: 'userId' });
Workout.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Attendance, { as: 'attendances', foreignKey: 'userId' });
Attendance.belongsTo(User, { as: 'user', foreignKey: 'userId' });

module.exports = {
    sequelize,
    User,
    Workout,
    Attendance,
};
