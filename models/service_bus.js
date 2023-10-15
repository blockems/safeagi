const {DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Define the Message model for the service bus
class Message extends Model {}

Message.init({
    topic: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Pending'
    },
    retryCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    errorLog: {
        type: DataTypes.TEXT
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Message'
});

class ServiceBus {
    static topics = new Set(); 

    static async initialize() {
        await sequelize.sync();
    }

    static createTopic(topicName) {
        // Add the topic to the in-memory collection
        this.topics.add(topicName);
    }

    static deleteTopic(topicName) {
        // Remove the topic from the in-memory collection
        this.topics.delete(topicName);
    }

    static hasTopic(topicName) {
        // Check if the topic exists in the in-memory collection
        return this.topics.has(topicName);
    }

    static async publish(topic, content) {
        if (this.hasTopic(topic)) {
            const message = await Message.create({ topic, content });
            
            // If the topic is 'messages:north', emit the message to all connected socket clients
            if (topic === 'messages:north') {
                global.io.emit('message', { msg: message.content });
                
                // Set the status to 'Processed' and save the changes
                message.status = 'Processed';
                await message.save();
            }
    
            return message;
        } else {
            throw new Error('Topic not found');
        }
    }    

    static async publishMultiple(messages) {
        // Each message in the array should be an object with 'topic' and 'content' properties
        return await Message.bulkCreate(messages);
    }

    static async processMessage(handler) {
        const message = await Message.findOne({ where: { status: 'Pending' } });
        if (message) {
            try {
                await handler(message);
                message.status = 'Processed';
            } catch (error) {
                message.retryCount += 1;
                message.errorLog = error.message;
                if (message.retryCount > 3) {
                    message.status = 'Failed';
                }
            } finally {
                await message.save();
            }
        }
    }

    static async processMultipleMessages(handler, limit = 10) {
        const messages = await Message.findAll({ 
            where: { status: 'Pending' },
            limit: limit 
        });

        for (let message of messages) {
            try {
                await handler(message);
                message.status = 'Processed';
            } catch (error) {
                message.retryCount += 1;
                message.errorLog = error.message;
                if (message.retryCount > 3) {
                    message.status = 'Failed';
                }
            } finally {
                await message.save();
            }
        }
    }

    static async archiveProcessedMessages() {
        await Message.destroy({ where: { status: 'Processed' } });
    }

    static async getFailedMessages() {
        return await Message.findAll({ where: { status: 'Failed' } });
    }
}

module.exports = { ServiceBus, Message };
