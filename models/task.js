const {DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Task extends Model {
    static async load(id) {
        return await Task.findByPk(id);
    }

    static async update_field(id, fieldname, value) {
        const task = await Task.findByPk(id);
        if (task && task.getDataValue(fieldname) !== undefined) {
            task.setDataValue(fieldname, value);
            await task.save();
        }
    }

    static async get_field(id, fieldname) {
        const task = await Task.findByPk(id);
        return task ? task.getDataValue(fieldname) : null;
    }

    static async add(taskData) {
        return await Task.create(taskData);
    }

    static async clear() {
        return await Task.destroy({ where: {} });
    }
}

Task.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: DataTypes.STRING,
    category: DataTypes.STRING,
    parent: DataTypes.INTEGER,
    as_a: DataTypes.STRING,
    i_want_to: DataTypes.STRING,
    so_i_can: DataTypes.STRING,
    ac: DataTypes.STRING,
    project_id: DataTypes.INTEGER,
    user_lists: {
        type: DataTypes.JSON,
        defaultValue: {
            created_by: null,
            responsible_list: [],
            assigned_list: [],
            consulted_list: [],
            informed_list: [],
            watch_list: []
        }
    },
    status_list: {
        type: DataTypes.JSON,
        defaultValue: {
            task: null
        }
    },
    date_list: {
        type: DataTypes.JSON,
        defaultValue: {
            create_date: new Date(),
            last_updated_date: null,
            due_date: null
        }
    }
}, {
    sequelize,
    modelName: 'task',
    timestamps: false,
    hooks: {
        beforeUpdate: (task, options) => {
            task.date_list.last_updated_date = new Date();
        }
    }
});

module.exports = Task;