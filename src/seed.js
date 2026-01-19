import "dotenv/config";
import bcrypt from "bcryptjs";

import connect from "./config/db.js";
import Organization from "./modules/org/org.model.js";
import User from "./modules/users/user.model.js";
import AuthAccount from "./modules/auth/authAccount.model.js";

const seed = async () => {
  try {
    await connect();

    console.log("Seeding started...");

    // 1️⃣ Create Organization
    let org = await Organization.findOne({
      contactEmail: process.env.ADMIN_EMAIL,
    });

    if (!org) {
      org = await Organization.create({
        name: "Default Org",
        contactEmail: process.env.ADMIN_EMAIL,
        type: "GENERIC",
      });

      console.log("Organization created");
    }

    // 2️⃣ Create User Profile
    let user = await User.findOne({
      email: process.env.ADMIN_EMAIL,
      organizationId: org._id,
    });

    if (!user) {
      user = await User.create({
        name: "Platform Admin",
        email: process.env.ADMIN_EMAIL,
        organizationId: org._id,
      });

      console.log("User profile created");
    }

    // 3️⃣ Create Auth Credential
    let account = await AuthAccount.findOne({
      identifier: process.env.ADMIN_EMAIL,
    });

    if (!account) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      account = await AuthAccount.create({
        userId: user._id,
        provider: "LOCAL",
        identifier: process.env.ADMIN_EMAIL,
        passwordHash: hash,
      });

      console.log("Auth account created");
    }

    console.log("Seed completed ✅");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed ❌", err.message);
    process.exit(1);
  }
};

seed();
