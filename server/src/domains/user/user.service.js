import User from "../../models/User.js";

/**
 * Verify user details against pre-registered information
 * @param {String} userType - Type of user
 * @param {String} username - Username
 * @param {String} name - Full name
 * @returns {Promise<Object>} - User object if verified
 */
export const verifyUserDetails = async (userType, username, name) => {
  const user = await User.findOne({
    username: username.toLowerCase(),
    userType,
    name,
  });

  if (!user) {
    const error = new Error("User not found. Please check your details.");
    error.statusCode = 404;
    throw error;
  }

  if (user.active === true) {
    const error = new Error("User already verified. Please login.");
    error.statusCode = 400;
    throw error;
  }

  return user;
};
