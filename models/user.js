const {DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

class User extends Model {
    // Instance methods
    async checkPassword(password) {
        return bcrypt.compare(password, this.password);
    }

    async setPassword(password) {
        this.password = await bcrypt.hash(password, 10);
    }

    // Class methods
    static async load(id) {
        return await User.findByPk(id);
    }

    static async update_field(id, fieldname, value) {
        const user = await User.findByPk(id);
        if (user?.getDataValue(fieldname) !== undefined) {
            user.setDataValue(fieldname, value);
            await user.save();
        }
    }

    static async get_field(id, fieldname) {
        const user = await User.findByPk(id);
        return user ? user.getDataValue(fieldname) : null;
    }

    static async add(userData) {
        return await User.create(userData);
    }

    static async clear() {
        await User.destroy({ where: {} });
    }

    static async authenticate(email, password) {
        const user = await User.findOne({ where: { email } });
        if (user && await user.checkPassword(password)) {
            return user;
        }
        return null;
    }
}

User.init({
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: DataTypes.STRING,
    firstname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zipcode: DataTypes.STRING,
    country: DataTypes.STRING,
    companyid: DataTypes.INTEGER,
    openai_api_key: DataTypes.STRING
}, {
    sequelize,
    modelName: 'User',
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

module.exports = User;
