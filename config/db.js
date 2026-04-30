import { config } from "dotenv";
import { ProfileRepository } from "../repository/profile-repository.js";
import { APIError } from "../middleware/error-handler.js";

config();

const preparedData = await import("../seed_profiles.json", {
  with: { type: "json" },
});

export async function DbSeeding() {
  try {
    // for vercel
    const Profile = new ProfileRepository();

    const count = await Profile.prisma.profile.count();

    if (count > 0) {
      console.info("Profiles Already exist. Skipping seed");
      return;
    }

    await Profile.createMany(preparedData.default.profiles);

    console.log("Profiles Seeding Successful");
  } catch (err) {
    throw new APIError(err, 500);
  }
}
