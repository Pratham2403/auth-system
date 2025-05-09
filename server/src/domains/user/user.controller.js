import User from "../../models/User.js";
import { UserType } from "../../../../../shared/types/user.type.js";
import { deleteFromCloudinary } from "../../config/coludinaryConnection.js";

export const createUser = async (userDatas) => {
  try {
    const { username, name, userType, gradYear } = userDatas;
    const userData = {
      name,
      userType,
    };

    if (userType === UserType.STUDENT) {
      const admissionNumber = username.toLowerCase();
      if (!admissionNumber) {
        return {
          success: false,
          error: "Admission number is required",
          username,
          name,
        };
      }
      const user = await User.findOne({
        "studentDetails.admissionNumber": admissionNumber,
        userType,
      });
      if (user) {
        return {
          success: false,
          error: "User already exists",
          username,
          name,
        };
      }
      userData.studentDetails = {
        gradYear,
        admissionNumber: username.toLowerCase(),
      };
    } else if (userType === UserType.PROFESSOR) {
      const email = username.toLowerCase();
      if (!email) {
        return {
          success: false,
          error: "Email is required",
          username,
          name,
        };
      }
      const user = await User.findOne({
        email,
        userType,
      });
      if (user) {
        return {
          success: false,
          error: "User already exists",
          username,
          name,
        };
      }
      userData.email = email;
    } else if (userType === UserType.ALUMNI) {
      const user = await User.findOne({
        name,
        userType,
      });
      if (user) {
        return {
          success: false,
          error: "User already exists",
          username,
          name,
        };
      }
      userData.alumniDetails = {
        gradYear,
      };
    }

    const result = await new User(userData).save();

    return {
      success: true,
      user: result,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: "Internal server error",
      username: userDatas.username,
      name: userDatas.name,
    };
  }
};

// export const getUsers = async (req, res) => {};

export const getUserById = async (req, res) => {
  try {
    // Extract search parameters from the request
    const query = req.params.id ? { _id: req.params.id } : req.body;

    // Build the search criteria
    const searchCriteria = {};

    if (query._id) {
      searchCriteria._id = query._id;
    } else {
      if (query.name) {
        // Case insensitive partial match for name
        searchCriteria.name = { $regex: new RegExp(query.name, "i") };
      }

      if (query.username) {
        // Case insensitive search for username
        searchCriteria.username = { $regex: new RegExp(query.username, "i") };
      }

      if (query.email) {
        // Case insensitive search for email
        searchCriteria.email = { $regex: new RegExp(query.email, "i") };
      }

      // For student admission number
      if (query.admissionNumber) {
        searchCriteria["studentDetails.admissionNumber"] = {
          $regex: new RegExp(query.admissionNumber, "i"),
        };
      }

      // For graduation year (applies to both students and alumni)
      if (query.gradYear) {
        searchCriteria.$or = [
          { "studentDetails.gradYear": query.gradYear },
          { "alumniDetails.gradYear": query.gradYear },
        ];
      }
    }

    // Find all users matching the search criteria
    const users = await User.find(searchCriteria);

    if (!users.length) {
      return res.status(404).json({
        success: false,
        error: "No users found",
      });
    }

    // Map users to the desired response format
    const formattedUsers = users.map((user) => ({
      id: user._id,
      name: user.name,
      username: user.username,
      userType: user.userType,
      lastLogin: user.lastLogin,
      status: user.active ? "Active" : "Inactive",
      email: user.email,
      profilePicture: user.profilePicture,
      studentDetails: user?.studentDetails,
      alumniDetails: user?.alumniDetails,
      professorDetails: user?.professorDetails,
    }));

    return res.status(200).json({
      success: true,
      count: users.length,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      error: "Error fetching users",
      message: error.message,
    });
  }
};

// export const updateUser = async (req, res) => {};

export const resetUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Delete profile picture from Cloudinary if it exists

    if (user.profilePicture && user.profilePicture.publicId) {
      await deleteFromCloudinary(user.profilePicture.publicId);
    }

    // Preserve allowed fields
    const preservedFields = {
      name: user.name,
      username: user.username,
      userType: user.userType,
      studentDetails: user.studentDetails?.gradYear
        ? { gradYear: user.studentDetails.gradYear }
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

    return res.status(200).json({
      success: true,
      message: `User ${user.username} reset successfully`,
    });
  } catch (error) {
    console.error("Error resetting user:", error);
    return res.status(500).json({
      success: false,
      error: "Error resetting user",
      message: error.message,
    });
  }
};

// export const deleteUser = async (req, res) => {};
