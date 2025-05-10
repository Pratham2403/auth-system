import RabbitMQClient from "../../../../../shared/rabbitmq/rabbit.setup.js";
import config from "../../../../../shared/rabbitmq/user.configuration.js";
import User from "../../models/User.js";
import { UserType } from "../../../../../shared/types/user.type.js";
import { createUser } from "../../domains/user/user.controller.js";
import { register } from "../../domains/auth/auth.controller.js";
import { deleteFromCloudinary } from "../../config/coludinaryConnection.js";
import { log } from "console";

class UserRegistrationConsumer {
  constructor() {
    this.client = new RabbitMQClient();
  }

  async initialize(url) {
    await this.client.connect(url);

    // Queue should already be created and bound in UserService,
    // so we just need to ensure it exists
    // await this.client.createQueue(config.USER_QUEUES.BULK_USER_REGISTRATION);

    // Start consuming messages
    await this.client.consumeFromQueue(
      config.USER_QUEUES.BULK_USER_REGISTRATION,
      this.processBulkRegistration.bind(this)
    );

    await this.client.consumeFromQueue(
      config.USER_QUEUES.USER,
      async (content, message) => {
        // Extract routing key from message metadata
        const routingKey = message.fields?.routingKey;

        // Route to appropriate handler based on routing key
        if (routingKey === config.USER_ROUTING_KEYS.USER_DELETED) {
          return this.processDeleteUser(content);
        } else if (routingKey === config.USER_ROUTING_KEYS.USER_RESET) {
          return this.processResetUser(content);
        } else if (routingKey === config.USER_ROUTING_KEYS.USER_CREATED) {
          return this.processCreateUser(content);
        } else {
          console.warn(`Unhandled routing key: ${routingKey}`);
          return {
            success: false,
            error: `Unhandled routing key: ${routingKey}`,
          };
        }
      }
    );

  }

  /**
   * Check if user has admin privileges
   * @param {string} userId - The ID of the user to check
   * @returns {Promise<boolean>} - Whether the user has admin privileges
   */
  async isAdmin(userId) {
    try {
      const user = await User.findById(userId);
      return user && user.userType === UserType.ADMIN;
    } catch (error) {
      console.error(
        `Error checking admin privileges for user ${userId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Process bulk user registration message from RabbitMQ
   * @param {Object} message - The message from RabbitMQ
   * @returns {Promise<Object>} - Results of the bulk registration
   */
  async processBulkRegistration(message) {
    try {
      const { users, requestedBy } = message;


      // Check if the requesting user has admin privileges
      const hasAdminRights = await this.isAdmin(requestedBy.userId);

      if (!hasAdminRights) {
        console.warn(
          `Unauthorized bulk registration attempt by user ${requestedBy.userId}`
        );
        return {
          successful: [],
          failed: users.map((user) => ({
            username: user.username,
            name: user.name,
            error:
              "Unauthorized: Only administrators can perform bulk registrations",
          })),
          error: "UNAUTHORIZED",
        };
      }

      const results = {
        successful: [],
        failed: [],
      };

      // Process users in batches to handle large datasets efficiently
      const batchSize = 50;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);

        // Process each user in the current batch in parallel
        const batchResults = await Promise.all(
          batch.map(async (userData) => {
            return await createUser(userData);
          })
        );

        // Sort results into successful and failed
        batchResults.forEach((result) => {
          if (result.success) {
            results.successful.push({
              username: result.user.username,
              name: result.user.name,
              status: "created",
            });
          } else {
            results.failed.push({
              username: result.username,
              name: result.name,
              error: result.error,
            });
          }
        });
      }

      console.log(
        `Bulk registration completed. Success: ${results.successful.length}, Failed: ${results.failed.length}`
      );

      // Optional: Publish results to a status update queue
      // await this.publishRegistrationResults(results, requestedBy);

      return results;
    } catch (error) {
      console.error("Error processing bulk registration:", error);
      throw error;
    }
  }

  async processDeleteUser(message) {
    try {
      const { userId, requestedBy } = message;


      // Check if the requesting user has admin privileges
      const hasAdminRights = await this.isAdmin(requestedBy);

      if (!hasAdminRights) {
        console.warn(`Unauthorized delete user attempt by user ${requestedBy}`);
        return {
          success: false,
          error: "Unauthorized: Only administrators can delete users",
        };
      }

      // Delete the user
      const user = await User.findByIdAndDelete(userId);

      if (user.profilePicture && user.profilePicture.publicId) {
        await deleteFromCloudinary(user.profilePicture.publicId);
      }

      if (!user) {
        console.warn(`User ${userId} not found`);
        return {
          success: false,
          error: "User not found",
        };
      }

      return {
        success: true,
        message: `User ${user.username} deleted successfully`,
      };
    } catch (error) {
      console.error("Error processing delete user:", error);
      throw error;
    }
  }

  async processResetUser(message) {
    try {
      const { userId, requestedBy } = message;
      console.log(
        `Processing reset user ${userId} requested by ${requestedBy}`
      );

      // Check if the requesting user has admin privileges
      const hasAdminRights = await this.isAdmin(requestedBy);

      if (!hasAdminRights) {
        console.warn(`Unauthorized reset user attempt by user ${requestedBy}`);
        return {
          success: false,
          error: "Unauthorized: Only administrators can reset users",
        };
      }

      // Reset user completely while preserving specific fields
      const user = await User.findById(userId);
      if (user) {
        // Delete profile picture from Cloudinary if it exists
        if (user.profilePicture && user.profilePicture.publicId) {
          await deleteFromCloudinary(user.profilePicture.publicId);
        }
        

        // Preserve allowed fields
        const preservedFields = {
          name: user.name,
          userType: user.userType,
          studentDetails: user?.studentDetails?.admissionNumber
            ? {
                admissionNumber: user.studentDetails.admissionNumber,
                gradYear: user.studentDetails.gradYear,
              }
            : undefined,
          alumniDetails: user.alumniDetails?.gradYear
            ? { gradYear: user.alumniDetails.gradYear }
            : undefined,
        };

        

        // Reset all other fields to defaults
        user.email = undefined;
        user.password = undefined;
        user.active = false;
        user.professorDetails = undefined;
        user.username = undefined;
        // user.alumniDetails = undefined;
        // user.studentDetails = undefined;
        user.activationToken = undefined;
        user.activationExpires = undefined;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        // Reset profile picture
        user.profilePicture = {
          url: "",
          publicId: "",
        };

        // Restore preserved fields
        Object.assign(user, preservedFields);
        await user.save();
      }

      if (!user) {
        console.warn(`User ${userId} not found`);
        return {
          success: false,
          error: "User not found",
        };
      }

      console.log(`User ${user.username} reset successfully`);
      return {
        success: true,
        message: `User ${user.username} reset successfully`,
      };
    } catch (error) {
      console.error("Error processing reset user:", error);
      throw error;
    }
  }

  async processCreateUser(message) {
    try {
      const { userData, requestedBy, userType } = message;

      // Check if the requesting user has admin privileges

      const user = await register(userData);
      console.log(user);
      

      if (!user.success) {
        console.warn(`Failed to create user ${userData.username}`);
        return {
          success: false,
          error: "Failed to create user",
        };
      }

      console.log(`User ${userData.username} created successfully`);
      return {
        success: true,
        message: user.message,
      };
    } catch (error) {
      console.error("Error processing user creation:", error);
      throw error;
    }
  }
}

const userRegistrationConsumer = new UserRegistrationConsumer();
export default userRegistrationConsumer;
