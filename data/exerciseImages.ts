// Static image map for exercise images
// Keys must match the imageUrl field in exercises.json

const exerciseImages: Record<string, number> = {
  'Barbell-Bench-Press_Chest_thumbnail.jpg': require('../images/Barbell-Bench-Press_Chest_thumbnail.jpg'),
  'Barbell-Bent-Over-Row_Back_thumbnail.jpg': require('../images/Barbell-Bent-Over-Row_Back_thumbnail.jpg'),
  'Barbell-Curl_Upper-Arms_thumbnail.jpg': require('../images/Barbell-Curl_Upper-Arms_thumbnail.jpg'),
  'Barbell-Full-Squat_Thighs_thumbnail.jpg': require('../images/Barbell-Full-Squat_Thighs_thumbnail.jpg'),
  'Pull-up_Back_thumbnail.jpg': require('../images/Pull-up_Back_thumbnail.jpg'),
};

export default exerciseImages;
