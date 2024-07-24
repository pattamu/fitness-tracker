const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: {
                    args: 18,
                    msg: 'Age must be at least 18 years'
                }
            }
        },
        gender: {
            type: DataTypes.STRING
        },
        height: {
            type: DataTypes.FLOAT
        },
        mobile: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isIndianMobileNumber(value) {
                    if (!/^(?:\+91|91|0)?[6-9]\d{9}$/.test(value)) {
                        throw new Error('Invalid mobile number');
                    }
                }
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: 'Invalid email format'
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [8, 12],
                    msg: 'Password must be between 8 and 12 characters'
                },
                isComplex(value) {
                    // Regex to enforce password complexity
                    if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}|:"<>?~-]).{8,12}/.test(value)) {
                        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character');
                    }
                }
            }
        },
        city: {
            type: DataTypes.STRING
        },
        dob: {
            type: DataTypes.DATEONLY
        },
        balance:{
            type: DataTypes.INTEGER,
            defaultValue: 5000
        },
        subscription: {
            type: DataTypes.ARRAY(DataTypes.JSONB),
            allowNull: true,
            defaultValue: []
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'createdat'
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updatedat'
        }
    },{
        hooks: {
            beforeCreate: async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                user.password = hashedPassword;
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    const hashedPassword = await bcrypt.hash(user.password, 10);
                    user.password = hashedPassword;
                }
            }
        }
    });

    User.associate = function(models) {
        User.hasMany(models.Attendance, {
            foreignKey: 'userId',
            as: 'attendances'
        });
    };

    return User;
};
