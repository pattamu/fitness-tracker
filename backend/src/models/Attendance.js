module.exports = (sequelize, DataTypes) => {
    const Attendance = sequelize.define('Attendance', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false // Default value is false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'createdat'
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updatedat'
        }
    });

    Attendance.associate = function(models) {
        Attendance.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    };

    return Attendance;
};
