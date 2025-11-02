import MemberRoleAssignment from "../../models/MemberRoleAssignment.js";
import User from "../../models/User.js";

/**
 * Batch create member role assignments
 * Note: No transactions used to support standalone MongoDB instances
 */
export const batchCreateMemberRoles = async (assignments, assignedBy) => {
  const results = [];
  const errors = [];

  for (const assignment of assignments) {
    try {
      const { userId, roleType, membershipKey } = assignment;

      // Verify user exists and fetch user data
      const user = await User.findById(userId);
      if (!user) {
        errors.push({
          userId,
          error: "User not found",
        });
        continue;
      }

      // Auto-extract membershipKey from gradYear for Lifetime Members and Secretaries
      let finalMembershipKey = membershipKey;

      // For Lifetime Members and Secretaries, use alumniDetails.gradYear if membershipKey not provided
      if (
        !finalMembershipKey &&
        (roleType === "Lifetime Member" || roleType === "Secretary")
      ) {
        const gradYear =
          user.alumniDetails?.gradYear || user.studentDetails?.gradYear;
        if (!gradYear) {
          errors.push({
            userId,
            error: "Graduation year not found in user profile",
          });
          continue;
        }
        finalMembershipKey = gradYear.toString();
      }

      // For Annual Members, membershipKey is required
      if (!finalMembershipKey) {
        errors.push({
          userId,
          error: "Membership key is required for this role type",
        });
        continue;
      }

      // Check if assignment already exists
      const existingAssignment = await MemberRoleAssignment.findOne({
        user: userId,
        roleType,
        membershipKey: finalMembershipKey,
      });

      if (existingAssignment) {
        errors.push({
          userId,
          roleType,
          membershipKey: finalMembershipKey,
          error: "Assignment already exists",
        });
        continue;
      }

      // Create new assignment
      const newAssignment = await MemberRoleAssignment.create({
        user: userId,
        roleType,
        membershipKey: finalMembershipKey,
        assignedBy,
      });

      results.push(newAssignment);
    } catch (error) {
      errors.push({
        userId: assignment.userId,
        error: error.message || "Failed to create assignment",
      });
    }
  }

  return {
    success: true,
    created: results,
    errors,
  };
};

/**
 * Delete a member role assignment
 */
export const deleteMemberRole = async (assignmentId) => {
  const assignment = await MemberRoleAssignment.findByIdAndDelete(assignmentId);

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  return {
    success: true,
    deleted: assignment,
  };
};

/**
 * Get all member role assignments with filters
 */
export const getMemberRoleAssignments = async (filters = {}) => {
  const query = {};

  if (filters.roleType) {
    query.roleType = filters.roleType;
  }

  if (filters.membershipKey) {
    query.membershipKey = filters.membershipKey;
  }

  if (filters.userId) {
    query.user = filters.userId;
  }

  const assignments = await MemberRoleAssignment.find(query)
    .populate(
      "user",
      "name email profilePicture userType studentDetails alumniDetails"
    )
    .populate("assignedBy", "name email")
    .sort({ membershipKey: -1, createdAt: -1 });

  return {
    success: true,
    data: assignments,
    count: assignments.length,
  };
};

/**
 * Get public members data with aggregation
 */
export const getPublicMembers = async (filters = {}) => {
  const matchStage = {};

  if (filters.roleType) {
    matchStage.roleType = filters.roleType;
  }

  if (filters.membershipKey) {
    matchStage.membershipKey = filters.membershipKey;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userData",
      },
    },
    { $unwind: "$userData" },
    {
      $project: {
        userId: "$userData._id",
        name: "$userData.name",
        gradYear: {
          $ifNull: [
            "$userData.alumniDetails.gradYear",
            "$userData.studentDetails.gradYear",
          ],
        },
        profilePicture: "$userData.profilePicture.url",
        userType: "$userData.userType",
        roleType: 1,
        membershipKey: 1,
        assignedAt: 1,
      },
    },
    { $sort: { membershipKey: -1, name: 1 } },
  ];

  const members = await MemberRoleAssignment.aggregate(pipeline);

  return {
    success: true,
    data: members,
    count: members.length,
  };
};

/**
 * Get grouped members by role type and membership key
 */
export const getGroupedMembers = async () => {
  const pipeline = [
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userData",
      },
    },
    { $unwind: "$userData" },
    {
      $project: {
        userId: "$userData._id",
        name: "$userData.name",
        gradYear: {
          $ifNull: [
            "$userData.alumniDetails.gradYear",
            "$userData.studentDetails.gradYear",
          ],
        },
        profilePicture: "$userData.profilePicture.url",
        userType: "$userData.userType",
        roleType: 1,
        membershipKey: 1,
        assignedAt: 1,
      },
    },
    {
      $group: {
        _id: {
          roleType: "$roleType",
          membershipKey: "$membershipKey",
        },
        members: {
          $push: {
            userId: "$userId",
            name: "$name",
            gradYear: "$gradYear",
            profilePicture: "$profilePicture",
            userType: "$userType",
          },
        },
      },
    },
    {
      $group: {
        _id: "$_id.roleType",
        data: {
          $push: {
            k: "$_id.membershipKey",
            v: "$members",
          },
        },
      },
    },
    {
      $project: {
        roleType: "$_id",
        data: { $arrayToObject: "$data" },
      },
    },
    { $sort: { roleType: 1 } },
  ];

  const groupedData = await MemberRoleAssignment.aggregate(pipeline);

  return {
    success: true,
    data: groupedData,
  };
};
