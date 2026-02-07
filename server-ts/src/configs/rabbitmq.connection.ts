import RabbitMQClient from "../../../../shared/rabbitmq/rabbit.setup";

// For a single instance of RabbitMQClient across the application
export const rabbitMQClient: RabbitMQClient = new RabbitMQClient();