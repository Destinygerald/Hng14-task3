export function selectCountry(country_array) {
  let result = {
    country_id: "",
    probability: 0,
  };

  if (country_array.length == 0) return;

  country_array.forEach((country) => {
    if (country.probability > result.probability) {
      result = { ...country };
    }
  });

  return result;
}

export function assignGroup(age) {
  if (age >= 0 && age <= 12) {
    return "child";
  } else if (age >= 13 && age <= 19) {
    return "teenager";
  } else if (age >= 20 && age <= 59) {
    return "adult";
  } else if (age >= 60) {
    return "senior";
  } else {
    return "invalid";
  }
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
