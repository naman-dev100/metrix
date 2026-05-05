import ExerciseList from "@/components/exercises/ExerciseList";

export default function ExercisesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Exercise Library</h1>
        <p className="text-[#a3a3aa] mt-1">Browse {">"}100 exercises by muscle group</p>
      </div>

      {/* Exercise List */}
      <ExerciseList />
    </div>
  );
}
