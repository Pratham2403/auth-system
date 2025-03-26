import userRegistrationConsumer from "./rabbitmq/user.service.js";

export const initializeServices = async () => {
  try {
    const rabbitMQUrl = process.env.RABBITMQ_URL;

    // Initialize existing services
    // ...

    // Initialize user registration consumer
    await userRegistrationConsumer.initialize(rabbitMQUrl);

    console.log("Services initialized successfully");
  } catch (error) {
    console.error("Failed to initialize services:", error);
    process.exit(1);
  }
};
