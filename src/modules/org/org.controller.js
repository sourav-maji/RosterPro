import Organization from "./org.model.js";
import ApiError from "../../utils/ApiError.js";
import { ok, fail } from "../../utils/response.js";

/**
 * Handle Mongo duplicate key error
 */

const handleDup = (err) => {
  if (err.code === 11000) {
    return new ApiError(
      (message =
        "Organization with same name and contact email already exists"),
      (status = 400),
    );
  }
  return err;
};

// Create

export const createOrg = async (req, res, next) => {
  try {
    const { name, contactEmail } = req.body;
    if (!name || !contactEmail || name === null || contactEmail === null) {
      const error = new ApiError("Name or Contact Email is missing", 400);
      return next(error);
    }
    const org = await Organization.create(req.body);
    return ok(res, org, "Organization created", 201);
  } catch (error) {
    next(handleDup(error));
  }
};

// LIST with basic filters
export const listOrg = async (req, res, next) => {
  try {
    const { status, type, search } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const data = await Organization.find(filter).sort({ createdAt: -1 });

    return ok(res, data);
  } catch (err) {
    next(err);
  }
};

// GET BY ID
export const getOrg = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);

    if (!org) {
      throw new ApiError("Organization not found", 404);
    }

    return ok(res, org);
  } catch (err) {
    next(err);
  }
};

// UPDATE
export const updateOrg = async (req, res, next) => {
  try {
    const org = await Organization.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!org) {
      throw new ApiError("Organization not found", 404);
    }

    return ok(res, org, "Organization updated");
  } catch (err) {
    next(handleDup(err));
  }
};

// DELETE
export const deleteOrg = async (req, res, next) => {
  try {
    const org = await Organization.findByIdAndDelete(req.params.id);

    if (!org) {
      throw new ApiError("Organization not found", 404);
    }

    return ok(res, null, "Organization deleted",204);
  } catch (err) {
    next(err);
  }
};

// MY ORG (for logged-in user)
export const myOrg = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.user.organizationId);

    if (!org) {
      throw new ApiError("Organization not found", 404);
    }

    return ok(res, org);
  } catch (err) {
    next(err);
  }
};

// COUNT
export const countOrg = async (req, res, next) => {
  try {
    const count = await Organization.countDocuments();
    return ok(res, { count });
  } catch (err) {
    next(err);
  }
};

// TOGGLE ACTIVE
export const toggleActive = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.id);

    if (!org) throw new ApiError("Organization not found", 404);

    org.isActive = !org.isActive;
    await org.save();

    return ok(res, org, "Status toggled");
  } catch (err) {
    next(err);
  }
};
