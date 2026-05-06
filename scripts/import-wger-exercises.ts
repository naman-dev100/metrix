import { PrismaClient } from "@prisma/client";
import https from "https";
import { URL } from "url";

const prisma = new PrismaClient();

// Wger API base URL
const WGER_API = "https://wger.de/api/v2/exerciseinfo/";
const LIMIT = 200; // Fetch 200 at a time

interface WgerExercise {
  id: number;
  translations: { id: number; name: string; language: number }[];
  category: { id: number; name: string };
  muscles: { id: number; name: string }[];
  muscles_secondary: { id: number; name: string }[];
  equipment: number[];
}

// Category mapping (Wger uses IDs, we use strings)
const CATEGORY_MAP: Record<number, string> = {
  1: "Barbell",
  2: "Dumbbell",
  3: "Machine",
  4: "Cable",
  5: "Bodyweight",
  6: "Cardio",
};

// Muscle group mapping
const MUSCLE_MAP: Record<number, string> = {
  1: "Chest", // Pectorals
  2: "Back",  // Lats
  3: "Back",  // Traps
  4: "Legs",  // Quads
  5: "Legs",  // Hamstrings
  6: "Legs",  // Calves
  7: "Shoulders", // Shoulders
  8: "Arms", // Biceps
  9: "Arms", // Triceps
  10: "Core", // Abs
  11: "Core", // Obliques
  12: "Back", // Lower back
  13: "Legs", // Glutes
  14: "Back", // Middle back
};

// Equipment mapping
const EQUIPMENT_MAP: Record<number, string> = {
  1: "barbell",
  2: "dumbbell", 
  3: "machine",
  4: "cable",
  7: "bodyweight",
};

async function fetchAllExercises(): Promise<WgerExercise[]> {
  let allExercises: WgerExercise[] = [];
  let offset = 0;
  let hasMore = true;

  console.log("Fetching exercises from Wger API (exerciseinfo endpoint)...");

  while (hasMore) {
    const url = `${WGER_API}?limit=${LIMIT}&offset=${offset}&language=2`;
    console.log(`Fetching: ${url}`);

    const data = await new Promise<any>((resolve, reject) => {
      https.get(url, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      }).on("error", reject);
    });

    if (data.results && data.results.length > 0) {
      allExercises = allExercises.concat(data.results);
      offset += LIMIT;
      hasMore = !!data.next;
    } else {
      hasMore = false;
    }
  }

  return allExercises;
}

function getExerciseName(exercise: WgerExercise): string {
  // Get name from translations (English, language=2)
  if (exercise.translations && exercise.translations.length > 0) {
    // Find English translation
    const englishTranslation = exercise.translations.find((t: any) => t.language === 2);
    if (englishTranslation?.name) {
      return englishTranslation.name;
    }
    // Fallback to first translation
    if (exercise.translations[0]?.name) {
      return exercise.translations[0].name;
    }
  }
  return "";
}

function getMuscleGroup(exercise: WgerExercise): string {
  // Primary muscle (first in muscles array)
  if (exercise.muscles && exercise.muscles.length > 0) {
    const primary = exercise.muscles[0];
    return MUSCLE_MAP[primary.id] || "Other";
  }
  // Secondary muscles
  if (exercise.muscles_secondary && exercise.muscles_secondary.length > 0) {
    const secondary = exercise.muscles_secondary[0];
    return MUSCLE_MAP[secondary.id] || "Other";
  }
  return "Other";
}

function getCategory(exercise: WgerExercise): string {
  // Map equipment to our categories
  if (exercise.equipment && exercise.equipment.length > 0) {
    const eqId = exercise.equipment[0];
    const eqLower = (EQUIPMENT_MAP[eqId] || "").toLowerCase();
    
    if (eqLower.includes("barbell")) return "Barbell";
    if (eqLower.includes("dumbbell")) return "Dumbbell";
    if (eqLower.includes("machine")) return "Machine";
    if (eqLower.includes("cable")) return "Cable";
    if (eqLower.includes("bodyweight") || eqLower.includes("body weight")) return "Bodyweight";
  }
  
  // Fallback to Wger category
  if (exercise.category?.name) {
    const catName = exercise.category.name.toLowerCase();
    if (catName.includes("barbell")) return "Barbell";
    if (catName.includes("dumbbell")) return "Dumbbell";
    if (catName.includes("machine")) return "Machine";
    if (catName.includes("cable")) return "Cable";
    if (catName.includes("bodyweight")) return "Bodyweight";
    if (catName.includes("cardio")) return "Cardio";
  }
  
  return CATEGORY_MAP[exercise.category?.id] || "Other";
}

async function main() {
  try {
    console.log("Starting exercise import from Wger...");

    // Fetch all exercises from Wger
    const wgerExercises = await fetchAllExercises();
    console.log(`Fetched ${wgerExercises.length} exercises from Wger`);

    // Transform and upsert into our database
    let imported = 0;
    let skipped = 0;

    for (const wgerEx of wgerExercises) {
      const name = getExerciseName(wgerEx);
      const category = getCategory(wgerEx);
      const muscleGroup = getMuscleGroup(wgerEx);

      // Skip if missing essential data
      if (!name) {
        if (skipped < 5) {
          console.log(`Skipping ${wgerEx.id}: no name found`);
        }
        skipped++;
        continue;
      }

      try {
        await prisma.exercise.upsert({
          where: { id: `wger-${wgerEx.id}` },
          update: {
            name,
            category,
            muscle_group: muscleGroup,
            image_url: `https://placehold.co/300x300/1a1a2e/16a34a?text=${encodeURIComponent(name.replace(/\s+/g, '+'))}`,
          },
          create: {
            id: `wger-${wgerEx.id}`,
            name,
            category,
            muscle_group: muscleGroup,
            image_url: `https://placehold.co/300x300/1a1a2e/16a34a?text=${encodeURIComponent(name.replace(/\s+/g, '+'))}`,
          },
        });
        imported++;
        
        if (imported % 100 === 0) {
          console.log(`Imported ${imported}/${wgerExercises.length}...`);
        }
      } catch (err) {
        console.error(`Failed to import exercise ${wgerEx.id}:`, err);
        skipped++;
      }
    }

    console.log(`\n✅ Import complete!`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${wgerExercises.length}`);

  } catch (error) {
    console.error("Error importing exercises:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
