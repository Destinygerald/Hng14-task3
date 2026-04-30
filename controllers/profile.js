import { APIError, ExternalApiError } from "../middleware/error-handler.js";
import { validateProfileCreate } from "../utils/validator.js";
import { ProfileRepository } from "../repository/profile-repository.js";
import { assignGroup, capitalize, selectCountry } from "../utils/functions.js";
// import { logger } from "../utils/logger.js";
import { Parser } from "json2csv";

const DbProfile = new ProfileRepository();

export async function getProfiles(req, res) {
 // logger.info(`GET /profiles endpoint hit`);

  const {
    gender,
    age_group,
    country_id,
    min_age,
    max_age,
    min_gender_probability,
    min_country_probability,
    page,
    limit,
    sort_by,
    order,
  } = req.query;

  const known_age_group = ["child", "teenager", "adult", "elder"];

  const where = {};

  if (gender) {
    where.gender = gender;
  }

  if (age_group && known_age_group.includes(age_group)) {
    where.age_group = age_group;
  }

  if (country_id != null || country_id != undefined) {
    where.country_id = country_id;
  }

  if (min_gender_probability) {
    where.gender_probability = {};

    where.gender_probability.gte = parseFloat(min_gender_probability);
  }

  if (min_country_probability) {
    where.country_probability = {};
    where.country_probability.gte = parseFloat(min_country_probability);
  }

  if (min_age || max_age) {
    where.age = {};
    if (min_age) {
      where.age.gte = Number(min_age);
    }

    if (max_age) {
      where.age.lte = Number(max_age);
    }
  }

  const response = await DbProfile.getMany({
    where,
    page,
    limit,
    sort_by,
    order,
  });

  return res.status(200).json({
    status: "success",
    page: parseInt(response.page),
    limit: parseInt(response.limit),
    total: 2026,
    data: response.data,
  });
}

export async function searchForProfile(req, res) {
  //logger.info(`GET /profiles/search endpoint hit`);
  const query = req.query.q;

  const q = query.toLowerCase();

  const where = {};

  const known_age_group = ["child", "teenager", "adult", "elder"];

  if (!q) {
   // logger.warn(`GET /profiles/search Unable to interpret query q: ${q}`);
    throw new APIError("Unable to interpret query", 400);
  }

  if (q.includes("young")) {
    where.age = {};

    where.age.lte = 24;
    where.age.gte = 16;
  }

  if (q.includes("female")) {
    where.gender = "female";
  } else if (q.includes("male") && !q.includes("female")) {
    where.gender = "male";
  } else if (q.split(" ").includes("male") && q.includes("female")) {
    where.gender = undefined;
  }

  if (q.includes("from")) {
    if (q.split("from ")[1].trim().includes(" ")) {
     // logger.warn(
        //`GET /profiles/search Unable to interpret query q: ${q.split("from ")[1].trim()}`,
      //);
      throw new APIError("Unable to interpret query", 400);
    }

    where.country_name = capitalize(q.split("from ")[1]);
  }

  if (q.includes("above")) {
    where.age = {};
    where.age.gte = parseInt(q.split("above ")[1]);
  }

  if (q.includes("below")) {
    where.age = {};
    where.age.lte = parseInt(q.split("below ")[1]);
  }

  if (q.includes(known_age_group[0])) {
    where.age_group = known_age_group[0];
  } else if (q.includes(known_age_group[1])) {
    where.age_group = known_age_group[1];
  } else if (q.includes(known_age_group[2])) {
    where.age_group = known_age_group[2];
  } else if (q.includes(known_age_group[3])) {
    where.age_group = known_age_group[3];
  }

  if (Object.keys(parsedQuery).length === 0) {
    //logger.warn(
     // `GET /profiles/search Unable to interpret query q: ${q}; Not viable query`,
    //);
    throw new APIError("Unable to interpret query", 400);
  }

  const response = await DbProfile.getMany({ where });

  return res.status(200).json({
    status: "success",
    page: response.page,
    limit: response.limit,
    total: 2026,
    data: response.data,
  });
}

export async function createProfile(req, res) {
  //logger.info(`GET /profiles/search endpoint hit`);
  const { error } = validateProfileCreate(req.body);

  if (error) {
    //logger.warn("Validation Error", error.details[0].message);
    throw new APIError(error.details[0].message, 400);
  }

  const profileExists = await DbProfile.getByName(name);

  if (profileExists) {
    return res.status(200).json({
      status: "success",
      message: "Profile already exists",
      data: profileExists,
    });
  }

  // Get Gender
  const genderResponse = await fetch(
    `${process.env.GENDERIZE_API}?name=${name}`,
  );
  const gender = await genderResponse.json();

  if (!gender.gender)
    throw new ExternalApiError(`Genderize returned an invalid response`, 502);

  // Get Age
  const age = await fetch(`${process.env.AGIFY_API}?name=${name}`);

  const ageResponse = await age.json();

  if (!ageResponse.age)
    throw new ExternalApiError(`Agify returned an invalid response`, 502);

  // Get Nationality
  const nationality = await fetch(
    `${process.env.NATIONALIZE_API}?name=${name}`,
  );

  const nationalityResponse = await nationality.json();

  if (nationalityResponse.country.length == 0)
    throw new ExternalApiError(`Nationalize returned an invalid response`, 502);

  const nationalityResult = selectCountry(nationalityResponse.country);

  const newProfile = {
    name: name,
    gender: gender.gender,
    gender_probability: gender.probability,
    sample_size: gender.count,
    age: ageResponse.age,
    age_group: assignGroup(ageResponse.age),
    country_id: nationalityResult.country_id,
    country_probability: nationalityResult.probability,
  };

  const createdProfile = await DbProfile.create(newProfile);

  return res.status(201).json({
    status: "success",
    data: createdProfile,
  });
}

export async function getProfile(req, res) {
  // await connectDb();
  const { id } = req.params;

  const result = await DbProfile.getById(id);

  if (!result) throw new APIError("Profile not found", 404);

  return res.status(200).json({
    status: "success",
    data: result,
  });
}

export async function getProfileCSVFormat(req, res) {
  // await connectDb();

  const {
    gender,
    age_group,
    country_id,
    min_age,
    max_age,
    min_gender_probability,
    min_country_probability,
    page,
    limit,
    sort_by,
    order,
    format,
  } = req.query;

  if (!format || format !== "csv")
    throw new APIError("Format should be csv", 400);

  const known_age_group = ["child", "teenager", "adult", "elder"];

  const where = {};

  if (gender) {
    where.gender = gender;
  }

  if (age_group && known_age_group.includes(age_group)) {
    where.age_group = age_group;
  }

  if (country_id != null || country_id != undefined) {
    where.country_id = country_id;
  }

  if (min_gender_probability) {
    where.gender_probability = {};

    where.gender_probability.gte = parseFloat(min_gender_probability);
  }

  if (min_country_probability) {
    where.country_probability = {};
    where.country_probability.gte = parseFloat(min_country_probability);
  }

  if (min_age || max_age) {
    where.age = {};
    if (min_age) {
      where.age.gte = Number(min_age);
    }

    if (max_age) {
      where.age.lte = Number(max_age);
    }
  }

  const response = await DbProfile.getMany({
    where,
    page,
    limit,
    sort_by,
    order,
  });

  const parser = new Parser({
    fields: [
      "id",
      "name",
      "gender",
      "gender_probability",
      "age",
      "age_group",
      "country_id",
      "country_name",
      "country_probability",
      "created_at",
    ],
  });

  const csv = parser.parse(response);

  res.header("Content-Type", "text/csv");
  res.attachment(`profiles_${Date.now()}.csv`);

  res.send(csv);
}
