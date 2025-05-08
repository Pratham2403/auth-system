import User from "../../models/User.js";
import { UserType } from "../../../../../shared/types/user.type.js";

/**
 * Verify user details against pre-registered information
 * @param {UserType} userType - Type of user
 * @param {String} email - Email of the user
 * @param {String} name - Full name
 * @param {String} admissionNumber - Admission number for students
 * @returns {Promise<Object>} - User object if verified
 */
export const verifyUserDetails = async (
  userType,
  email,
  name,
  admissionNumber
) => {
  let user;

  if (userType === UserType.STUDENT) {
    user = await User.findOne({
      "studentDetails.admissionNumber": admissionNumber
        ? admissionNumber.toLowerCase()
        : "",
      userType,
      name,
    });
  } else if (userType === UserType.PROFESSOR) {
    user = await User.findOne({
      email: email.toLowerCase(),
      userType,
    });
  } else if (userType === UserType.ALUMNI) {
    user = await User.findOne({
      name,
      userType,
    });
  }

  console.log("User from Auth", user);

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
