import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const exercises = [
  // CHEST - Barbell
  { name: "Barbell Bench Press", category: "Barbell", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Bench+Press" },
  { name: "Incline Barbell Bench Press", category: "Barbell", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Incline+Bench" },
  { name: "Decline Barbell Bench Press", category: "Barbell", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Decline+Bench" },
  { name: "Barbell Floor Press", category: "Barbell", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Floor+Press" },
  { name: "Barbell Pullover", category: "Barbell", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Pullover" },

  // CHEST - Dumbbell
  { name: "Dumbbell Bench Press", category: "Dumbbell", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Bench" },
  { name: "Incline Dumbbell Bench Press", category: "Dumbbell", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Incline+DB" },
  { name: "Decline Dumbbell Bench Press", category: "Dumbbell", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Decline+DB" },
  { name: "Dumbbell Flyes", category: "Dumbbell", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Flyes" },
  { name: "Incline Dumbbell Flyes", category: "Dumbbell", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Incline+Flyes" },
  { name: "Dumbbell Pullover", category: "Dumbbell", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Pullover" },
  { name: "Dumbbell Chest Press", category: "Dumbbell", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Press" },

  // CHEST - Machine
  { name: "Chest Press Machine", category: "Machine", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Chest+Press+Machine" },
  { name: "Pec Deck Fly", category: "Machine", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Pec+Deck" },
  { name: "Cable Chest Fly", category: "Cable", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Cable+Fly" },
  { name: "Low-to-High Cable Fly", category: "Cable", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Low+Fly" },
  { name: "Machine Dip (Chest)", category: "Machine", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Machine+Dip" },

  // CHEST - Bodyweight
  { name: "Push-ups", category: "Bodyweight", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Push-ups" },
  { name: "Incline Push-ups", category: "Bodyweight", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Incline+Push" },
  { name: "Decline Push-ups", category: "Bodyweight", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Decline+Push" },
  { name: "Wide Push-ups", category: "Bodyweight", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Wide+Push" },
  { name: "Diamond Push-ups", category: "Bodyweight", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Diamond+Push" },
  { name: "Plyometric Push-ups", category: "Bodyweight", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Plyo+Push" },
  { name: "Dips (Chest Focus)", category: "Bodyweight", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Dips" },

  // BACK - Barbell
  { name: "Barbell Deadlift", category: "Barbell", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Deadlift" },
  { name: "Barbell Bent Over Row", category: "Barbell", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Bent+Row" },
  { name: "Barbell Shrugs", category: "Barbell", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Barbell+Shrugs" },
  { name: "Barbell Reverse Row", category: "Barbell", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Reverse+Row" },

  // BACK - Dumbbell
  { name: "Dumbbell Row", category: "Dumbbell", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Row" },
  { name: "Dumbbell Deadlift", category: "Dumbbell", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Deadlift" },
  { name: "Dumbbell Pullover", category: "Dumbbell", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Pullover" },
  { name: "Dumbbell Shrugs", category: "Dumbbell", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Shrugs" },
  { name: "Dumbbell Reverse Fly", category: "Dumbbell", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Reverse+Fly" },
  { name: "Single-Arm Dumbbell Row", category: "Dumbbell", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Single+Arm+Row" },

  // BACK - Cable
  { name: "Cable Seated Row", category: "Cable", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Cable+Row" },
  { name: "Cable Straight Arm Pulldown", category: "Cable", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Straight+Arm" },
  { name: "Cable Lat Pulldown", category: "Cable", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Cable+Pull" },
  { name: "Cable Face Pull", category: "Cable", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Face+Pull" },

  // BACK - Machine
  { name: "Lat Pulldown Machine", category: "Machine", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Lat+Pull" },
  { name: "Seated Row Machine", category: "Machine", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Seated+Row" },
  { name: "T-Bar Row Machine", category: "Machine", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=T-Bar" },
  { name: "Assisted Pull-up Machine", category: "Machine", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Assisted+Pull" },

  // BACK - Bodyweight
  { name: "Pull-ups", category: "Bodyweight", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Pull-ups" },
  { name: "Chin-ups", category: "Bodyweight", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Chin-ups" },
  { name: "Inverted Row", category: "Bodyweight", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Inverted+Row" },
  { name: "Wide Grip Pull-ups", category: "Bodyweight", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Wide+Pull" },
  { name: "Commando Pull-ups", category: "Bodyweight", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Commando" },

  // LEGS - Barbell
  { name: "Barbell Back Squat", category: "Barbell", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Back+Squat" },
  { name: "Barbell Front Squat", category: "Barbell", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Front+Squat" },
  { name: "Barbell Hip Thrust", category: "Barbell", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Hip+Thrust" },
  { name: "Barbell Romanian Deadlift", category: "Barbell", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=RDL" },
  { name: "Barbell Lunges", category: "Barbell", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Barbell+Lunge" },
  { name: "Barbell Step-up", category: "Barbell", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Step-up" },

  // LEGS - Dumbbell
  { name: "Dumbbell Squat", category: "Dumbbell", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Squat" },
  { name: "Dumbbell Lunges", category: "Dumbbell", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Lunge" },
  { name: "Dumbbell Romanian Deadlift", category: "Dumbbell", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+RDL" },
  { name: "Dumbbell Step-ups", category: "Dumbbell", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Step" },
  { name: "Dumbbell Goblet Squat", category: "Dumbbell", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Goblet+Squat" },
  { name: "Dumbbell Calf Raise", category: "Dumbbell", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Calf" },

  // LEGS - Machine
  { name: "Leg Press", category: "Machine", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Leg+Press" },
  { name: "Leg Extension", category: "Machine", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Leg+Ext" },
  { name: "Leg Curl (Seated)", category: "Machine", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Seated+Curl" },
  { name: "Leg Curl (Lying)", category: "Machine", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Lying+Curl" },
  { name: "Calf Raise Machine", category: "Machine", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Calf+Machine" },
  { name: "Smith Machine Squat", category: "Machine", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Smith+Squat" },
  { name: "Hip Adduction Machine", category: "Machine", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Adduction" },
  { name: "Hip Abduction Machine", category: "Machine", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Abduction" },

  // LEGS - Cable
  { name: "Cable Pull-through", category: "Cable", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Pull-through" },
  { name: "Cable Kickback", category: "Cable", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Kickback" },
  { name: "Cable Lunge", category: "Cable", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Cable+Lunge" },

  // LEGS - Bodyweight
  { name: "Bodyweight Squat", category: "Bodyweight", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Squat" },
  { name: "Bulgarian Split Squat", category: "Bodyweight", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Bulgarian" },
  { name: "Walking Lunges", category: "Bodyweight", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Walking+Lunge" },
  { name: "Jump Squat", category: "Bodyweight", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Jump+Squat" },
  { name: "Wall Sit", category: "Bodyweight", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Wall+Sit" },
  { name: "Glute Bridge", category: "Bodyweight", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Glute+Bridge" },
  { name: "Single Leg Glute Bridge", category: "Bodyweight", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Single+Bridge" },
  { name: "Calf Raise (Bodyweight)", category: "Bodyweight", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Bodyweight+Calf" },

  // SHOULDERS - Barbell
  { name: "Barbell Overhead Press", category: "Barbell", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=OHP" },
  { name: "Barbell Front Raise", category: "Barbell", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Front+Raise" },
  { name: "Barbell Upright Row", category: "Barbell", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Upright+Row" },

  // SHOULDERS - Dumbbell
  { name: "Dumbbell Shoulder Press", category: "Dumbbell", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Press" },
  { name: "Dumbbell Lateral Raise", category: "Dumbbell", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Lateral+Raise" },
  { name: "Dumbbell Front Raise", category: "Dumbbell", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Front" },
  { name: "Dumbbell Reverse Fly", category: "Dumbbell", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Reverse" },
  { name: "Dumbbell Shrugs", category: "Dumbbell", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Shrugs" },
  { name: "Arnold Press", category: "Dumbbell", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Arnold" },
  { name: "Dumbbell Clean and Press", category: "Dumbbell", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Clean+Press" },

  // SHOULDERS - Machine
  { name: "Shoulder Press Machine", category: "Machine", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Shoulder+Machine" },
  { name: "Pec Deck (Reverse)", category: "Machine", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Reverse+Deck" },

  // SHOULDERS - Cable
  { name: "Cable Lateral Raise", category: "Cable", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Cable+Lat" },
  { name: "Cable Front Raise", category: "Cable", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Cable+Front" },
  { name: "Cable Face Pull", category: "Cable", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Cable+Face" },
  { name: "Single-Arm Cable Press", category: "Cable", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Single+Press" },

  // SHOULDERS - Bodyweight
  { name: "Pike Push-ups", category: "Bodyweight", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Pike+Push" },
  { name: "Handstand Push-ups", category: "Bodyweight", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=HSPU" },
  { name: "Handstand Hold", category: "Bodyweight", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Handstand" },
  { name: "Shoulder Tap (Plank)", category: "Bodyweight", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Shoulder+Tap" },

  // ARMS - Biceps
  { name: "Barbell Curl", category: "Barbell", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Barbell+Curl" },
  { name: "Dumbbell Bicep Curl", category: "Dumbbell", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Curl" },
  { name: "Hammer Curl", category: "Dumbbell", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Hammer+Curl" },
  { name: "Incline Dumbbell Curl", category: "Dumbbell", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Incline+Curl" },
  { name: "Preacher Curl", category: "Dumbbell", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Preacher" },
  { name: "Concentration Curl", category: "Dumbbell", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Concentration" },
  { name: "Cable Bicep Curl", category: "Cable", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Cable+Curl" },
  { name: "Cable Rope Curl", category: "Cable", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Rope+Curl" },
  { name: "Bicep Machine Curl", category: "Machine", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Bicep+Machine" },
  { name: "Chin-ups (Biceps)", category: "Bodyweight", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Chin-up" },

  // ARMS - Triceps
  { name: "Tricep Pushdown (Cable)", category: "Cable", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Pushdown" },
  { name: "Overhead Tricep Extension", category: "Dumbbell", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Overhead+Ext" },
  { name: "Tricep Dips", category: "Bodyweight", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Tricep+Dip" },
  { name: "Close-Grip Bench Press", category: "Barbell", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Close+Bench" },
  { name: "Dumbbell Tricep Kickback", category: "Dumbbell", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Kickback" },
  { name: "Skull Crusher", category: "Barbell", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Skull+Crusher" },
  { name: "Tricep Extension (Cable)", category: "Cable", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Cable+Ext" },
  { name: "Tricep Dip Machine", category: "Machine", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Tricep+Machine" },
  { name: "Diamond Push-ups", category: "Bodyweight", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Diamond+Push" },
  { name: "Tricep Extension (Dumbbell)", category: "Dumbbell", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=DB+Ext" },

  // CORE
  { name: "Plank", category: "Bodyweight", muscle_group: "Core", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Plank" },
  { name: "Crunches", category: "Bodyweight", muscle_group: "Core", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Crunches" },
  { name: "Hanging Leg Raise", category: "Bodyweight", muscle_group: "Core", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Leg+Raise" },
  { name: "Russian Twist", category: "Bodyweight", muscle_group: "Core", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Russian+Twist" },
  { name: "Ab Rollout", category: "Bodyweight", muscle_group: "Core", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Ab+Roll" },
  { name: "Cable Crunch", category: "Cable", muscle_group: "Core", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Cable+Crunch" },
  { name: "Weighted Crunch", category: "Dumbbell", muscle_group: "Core", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Weighted+Crunch" },
  { name: "Dead Bug", category: "Bodyweight", muscle_group: "Core", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Dead+Bug" },
  { name: "Bird Dog", category: "Bodyweight", muscle_group: "Core", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Bird+Dog" },
  { name: "Side Plank", category: "Bodyweight", muscle_group: "Core", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Side+Plank" },
  { name: "Mountain Climbers", category: "Bodyweight", muscle_group: "Core", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Mountain+Climber" },
  { name: "Cable Woodchop", category: "Cable", muscle_group: "Core", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Woodchop" },
  { name: "V-ups", category: "Bodyweight", muscle_group: "Core", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=V-ups" },
  { name: "Bicycle Crunches", category: "Bodyweight", muscle_group: "Core", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Bicycle" },
  { name: "Pallof Press", category: "Cable", muscle_group: "Core", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Pallof" },

  // CARDIO
  { name: "Treadmill Running", category: "Cardio", muscle_group: "Cardio", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Treadmill" },
  { name: "Stationary Bike", category: "Cardio", muscle_group: "Cardio", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Bike" },
  { name: "Rowing Machine", category: "Cardio", muscle_group: "Cardio", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Rowing" },
  { name: "Jump Rope", category: "Cardio", muscle_group: "Cardio", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Jump+Rope" },
  { name: "Battle Ropes", category: "Cardio", muscle_group: "Cardio", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Battle+Ropes" },
  { name: "Assault Bike / Air Bike", category: "Cardio", muscle_group: "Cardio", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Air+Bike" },
  { name: "Stair Climber", category: "Cardio", muscle_group: "Cardio", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Stair+Climb" },
  { name: "Kettlebell Swing", category: "Cardio", muscle_group: "Cardio", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=KB+Swing" },
  { name: "Burpees", category: "Cardio", muscle_group: "Cardio", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Burpees" },
  { name: "Box Jumps", category: "Cardio", muscle_group: "Cardio", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Box+Jump" },

  // Additional exercises for variety
  { name: "Sumo Deadlift", category: "Barbell", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Sumo+Deadlift" },
  { name: "Zercher Squat", category: "Barbell", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Zercher" },
  { name: "Barbell Good Morning", category: "Barbell", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Good+Morning" },
  { name: "Sissy Squat", category: "Bodyweight", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Sissy+Squat" },
  { name: "Nordic Hamstring Curl", category: "Bodyweight", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Nordic+Curl" },
  { name: "Hip Thrust (Machine)", category: "Machine", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Machine+Thrust" },
  { name: "Cable Calf Raise", category: "Cable", muscle_group: "Legs", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Cable+Calf" },
  { name: "Smith Machine Deadlift", category: "Machine", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Smith+Deadlift" },
  { name: "Chest Supported Row", category: "Machine", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Supported+Row" },
  { name: "Lat Pullover (Machine)", category: "Machine", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Machine+Pull" },
  { name: "Cable Cross-Over", category: "Cable", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Cable+Cross" },
  { name: "Machine Chest Fly", category: "Machine", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Machine+Fly" },
  { name: "Incline Cable Fly", category: "Cable", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Incline+Cable" },
  { name: "Cable Crossover (High to Low)", category: "Cable", muscle_group: "Chest", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=High+Low+Cross" },
  { name: "Dumbbell Chest Supported Row", category: "Dumbbell", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Supported+DB" },
  { name: "Cable Row (Rope Handle)", category: "Cable", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Rope+Row" },
  { name: "V-Bar Lat Pulldown", category: "Machine", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=V-Bar+Pull" },
  { name: "Wide Grip Lat Pulldown", category: "Machine", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Wide+Pull" },
  { name: "Supinated Lat Pulldown", category: "Machine", muscle_group: "Back", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Supinated+Pull" },
  { name: "Dumbbell External Rotation", category: "Dumbbell", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Ext+Rotation" },
  { name: "Cable Lateral Raise (Single Arm)", category: "Cable", muscle_group: "Shoulders", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Single+Lat" },
  { name: "Zottman Curl", category: "Dumbbell", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Zottman" },
  { name: "Spider Curl", category: "Dumbbell", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Spider" },
  { name: "Tricep Pushdown (Rope)", category: "Cable", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Rope+Push" },
  { name: "Tricep Pushdown (Straight Bar)", category: "Cable", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Bar+Push" },
  { name: "Cable Overhead Extension", category: "Cable", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Cable+Overhead" },
  { name: "Reverse Grip Tricep Pushdown", category: "Cable", muscle_group: "Arms", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Reverse+Push" },
  { name: "Ab Wheel Rollout (Weighted)", category: "Bodyweight", muscle_group: "Core", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Ab+Wheel" },
  { name: "Weighted Plank", category: "Bodyweight", muscle_group: "Core", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Weighted+Plank" },
  { name: "Cable Anti-Rotation Press", category: "Cable", muscle_group: "Core", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Anti-Rot" },
  { name: "Medicine Ball Slam", category: "Cardio", muscle_group: "Cardio", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Med+Ball+Slam" },
  { name: "Sled Push", category: "Cardio", muscle_group: "Cardio", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Sled+Push" },
  { name: "Sled Pull", category: "Cardio", muscle_group: "Cardio", image_url: "https://placehold.co/300x300/1a1a2e/16a34a?text=Sled+Pull" },
];

async function main() {
  console.log("🌱 Seeding database with exercises...");

  const client = await pool.connect();
  try {
    // Clear existing exercises
    await client.query("DELETE FROM \"Exercise\"");
    console.log("Cleared existing exercises");

    // Insert exercises using batch insert
    const values = exercises.map((ex) => {
      return `('${ex.name}', '${ex.category}', '${ex.muscle_group}', '${ex.image_url}')`;
    }).join(", ");

    // Insert each exercise individually with UUID generation
    for (const ex of exercises) {
      await client.query(
        `INSERT INTO "Exercise" (id, name, category, muscle_group, image_url) VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
        [ex.name, ex.category, ex.muscle_group, ex.image_url]
      );
    }

    console.log(`✅ Seeded ${exercises.length} exercises successfully!`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  });
