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
      message: `User ${user.id} reset successfully`,
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

export const getAllUsers = async (req, res) => {
  try {
    // Pagination, filtering and projection for scalability
    const {
      page = 1,
      limit = 100,
      userTypes, // array of UserType values
      search, // free text search for name/email/username/admission no
      gradYear, // filter by graduation year (students/alumni)
      onlyActive, // boolean
      fields, // optional array of field paths to project
      sortBy = "updatedAt",
      sortOrder = "desc",
    } = req.body || {};

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 5000);

    // Build filter
    const filter = {};
    if (Array.isArray(userTypes) && userTypes.length > 0) {
      filter.userType = { $in: userTypes };
    }
    if (onlyActive === true) {
      filter.active = true;
    }
    if (gradYear) {
      filter.$or = [
        { "studentDetails.gradYear": gradYear },
        { "alumniDetails.gradYear": gradYear },
      ];
    }
    if (search && typeof search === "string" && search.trim().length > 0) {
      const s = search.trim();
      const regex = new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        ...(filter.$or || []),
        { name: { $regex: regex } },
        { email: { $regex: regex } },
        { username: { $regex: regex } },
        { "studentDetails.admissionNumber": { $regex: regex } },
      ];
    }

    // Default projection to keep payload lean
    const defaultProjection = [
      "name",
      "username",
      "userType",
      "email",
      "lastLogin",
      "active",
      "profilePicture.url",
      "studentDetails.gradYear",
      "studentDetails.admissionNumber",
      "alumniDetails.gradYear",
      "professorDetails.position",
      "professorDetails.specialInterestGroups",
    ];
    const projectionList =
      Array.isArray(fields) && fields.length > 0 ? fields : defaultProjection;
    const projection = projectionList.join(" ");

    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // Query with lean() for performance
    const [items, total, counts] = await Promise.all([
      User.find(filter)
        .select(projection)
        .sort(sort)
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      User.countDocuments(filter),
      User.aggregate([
        { $match: filter },
        { $group: { _id: "$userType", count: { $sum: 1 } } },
      ]),
    ]);

    const countsByType = counts.reduce((acc, cur) => {
      acc[cur._id] = cur.count;
      return acc;
    }, {});

    // Map users to a normalized lightweight shape
    const users = items.map((u) => ({
      id: u._id?.toString?.() || u.id,
      name: u.name,
      username: u.username,
      userType: u.userType,
      email: u.email,
      lastLogin: u.lastLogin,
      status: u.active ? "Active" : "Inactive",
      profilePicture: u.profilePicture?.url
        ? { url: u.profilePicture.url }
        : undefined,
      studentDetails: u.studentDetails
        ? {
            gradYear: u.studentDetails.gradYear,
            admissionNumber: u.studentDetails.admissionNumber,
          }
        : undefined,
      alumniDetails: u.alumniDetails
        ? { gradYear: u.alumniDetails.gradYear }
        : undefined,
      professorDetails: u.professorDetails
        ? {
            position: u.professorDetails.position,
            specialInterestGroups: u.professorDetails.specialInterestGroups,
          }
        : undefined,
    }));

    return res.status(200).json({
      success: true,
      page: pageNum,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      countsByType,
      count: users.length,
      users,
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

// export const deleteUser = async (req, res) => {};
export const updateProfileImage = async (userId, profilePicture) => {
  try {
    // userId is required and corresponds to the _id field in the User document
    if (!userId) {
      throw new Error("userId is required");
    }

    // profilePicture is required
    if (!profilePicture) {
      throw new Error("profilePicture is required");
    }

    // Use findOneAndUpdate with a _id query to avoid relying on a non-existent userId field in the schema
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { profilePicture },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error updating profile image:", error);
    throw error;
  }
};
