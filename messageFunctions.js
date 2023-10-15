// messageFunctions.js

const { Message, ServiceBus } = require('./models');

const emitMessages = async (io, topicName, socketName) => {
    try {
        const pendingMessages = await Message.findAll({ where: { status: 'Pending', topic: topicName } });
        pendingMessages.forEach((message) => {
            io.emit(socketName, { "message": message.content });
            message.status = 'Processed';
            message.save();
        });
    } catch (error) {
        console.error('Error fetching and emitting messages:', error);
    }
};

const sendMessageToBus = async (io, topicName, content) => {
    try {
        if (ServiceBus.hasTopic(topicName)) {
            await ServiceBus.publish(topicName, content);
        } else {
            throw new Error('Topic not found in the ServiceBus');
        }
    } catch (error) {
        console.error('Error sending message to the bus:', error);
    }
};

module.exports = { emitMessages, sendMessageToBus };