import * as memberRolesService from "./member.service.js";

/**
 * @route POST /admin/v0/member-roles
 * @desc Batch create member role assignments (Admin only)
 * @access Private/Admin
 */
export const createMemberRoles = async (req, res, next) => {
  try {
    const { assignments } = req.body;

    if (
      !assignments ||
      !Array.isArray(assignments) ||
      assignments.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Assignments array is required and must not be empty",
      });
    }

    // Validate assignment structure
    for (const assignment of assignments) {
      if (!assignment.userId || !assignment.roleType) {
        return res.status(400).json({
          success: false,
          message: "Each assignment must have userId and roleType",
        });
      }

      // membershipKey is required only for Annual Members
      if (
        assignment.roleType === "Annual Member" &&
        !assignment.membershipKey
      ) {
        return res.status(400).json({
          success: false,
          message: "Membership key (year range) is required for Annual Members",
        });
      }
    }

    const result = await memberRolesService.batchCreateMemberRoles(
      assignments,
      req.user._id
    );

    return res.status(201).json({
      success: true,
      message: `Successfully created ${result.created.length} assignments`,
      data: result.created,
      errors: result.errors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route DELETE /admin/v0/member-roles/:id
 * @desc Delete a member role assignment (Admin only)
 * @access Private/Admin
 */
export const deleteMemberRole = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID is required",
      });
    }

    const result = await memberRolesService.deleteMemberRole(id);

    return res.status(200).json({
      success: true,
      message: "Member role assignment deleted successfully",
      data: result.deleted,
    });
  } catch (error) {
    if (error.message === "Assignment not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * @route GET /admin/v0/member-roles
 * @desc Get member role assignments with filters (Admin only)
 * @access Private/Admin
 */
export const getMemberRoles = async (req, res, next) => {
  try {
    const { roleType, membershipKey, userId } = req.query;

    const filters = {};
    if (roleType) filters.roleType = roleType;
    if (membershipKey) filters.membershipKey = membershipKey;
    if (userId) filters.userId = userId;

    const result = await memberRolesService.getMemberRoleAssignments(filters);

    return res.status(200).json({
      success: true,
      data: result.data,
      count: result.count,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /v0/members
 * @desc Get public members data (No authentication required)
 * @access Public
 */
export const getPublicMembers = async (req, res, next) => {
  try {
    const { roleType, membershipKey } = req.query;

    const filters = {};
    if (roleType) filters.roleType = roleType;
    if (membershipKey) filters.membershipKey = membershipKey;

    const result = await memberRolesService.getPublicMembers(filters);

    return res.status(200).json({
      success: true,
      data: result.data,
      count: result.count,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /v0/members/grouped
 * @desc Get all members grouped by role type and membership key (No authentication required)
 * @access Public
 */
export const getGroupedMembers = async (req, res, next) => {
  try {
    const result = await memberRolesService.getGroupedMembers();

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};
