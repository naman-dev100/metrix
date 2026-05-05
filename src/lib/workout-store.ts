import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface ExerciseSet {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weight: number | null;
  reps: number;
  isCompleted: boolean;
  isPR?: boolean;
}

export interface ActiveExercise {
  exerciseId: string;
  exerciseName: string;
  sets: ExerciseSet[];
}

interface WorkoutState {
  // Session state
  isActive: boolean;
  sessionId: string | null;
  startTime: Date | null;
  elapsedSeconds: number;
  routineName: string | null;
  activeExercises: ActiveExercise[];
  
  // Actions
  startSession: (sessionId: string, routineName?: string) => void;
  stopSession: () => void;
  tick: () => void;
  addExercise: (exerciseId: string, exerciseName: string) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string, weight: number | null, reps: number) => void;
  deleteSet: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => void;
  restTimer: number;
  setRestTimer: (seconds: number) => void;
  decrementRest: () => void;
}

const useWorkoutStore = create<WorkoutState>()(
  subscribeWithSelector((set) => ({
    isActive: false,
    sessionId: null,
    startTime: null,
    elapsedSeconds: 0,
    routineName: null,
    activeExercises: [],
    restTimer: 0,

    startSession: (sessionId: string, routineName?: string) => {
      set({
        isActive: true,
        sessionId,
        startTime: new Date(),
        elapsedSeconds: 0,
        routineName: routineName || null,
        activeExercises: [],
      });
    },

    stopSession: () => {
      set({
        isActive: false,
        sessionId: null,
        startTime: null,
        elapsedSeconds: 0,
        routineName: null,
        activeExercises: [],
        restTimer: 0,
      });
    },

    tick: () => {
      set((state) => ({
        elapsedSeconds: state.elapsedSeconds + 1,
      }));
    },

    addExercise: (exerciseId: string, exerciseName: string) => {
      set((state) => {
        if (state.activeExercises.find((e) => e.exerciseId === exerciseId)) {
          return state;
        }
        return {
          ...state,
          activeExercises: [
            ...state.activeExercises,
            { exerciseId, exerciseName, sets: [] },
          ],
        };
      });
    },

    removeExercise: (exerciseId: string) => {
      set((state) => ({
        ...state,
        activeExercises: state.activeExercises.filter(
          (e) => e.exerciseId !== exerciseId
        ),
      }));
    },

    addSet: (exerciseId: string, weight: number | null, reps: number) => {
      set((state) => {
        const exerciseIndex = state.activeExercises.findIndex(
          (e) => e.exerciseId === exerciseId
        );
        if (exerciseIndex === -1) return state;

        const exercises = [...state.activeExercises];
        const exercise = { ...exercises[exerciseIndex] };
        const setNumber = exercise.sets.length + 1;

        exercise.sets = [
          ...exercise.sets,
          {
            id: crypto.randomUUID(),
            exerciseId,
            exerciseName: exercise.exerciseName,
            setNumber,
            weight,
            reps,
            isCompleted: true,
          },
        ];

        exercises[exerciseIndex] = exercise;
        return { ...state, activeExercises: exercises };
      });
    },

    deleteSet: (exerciseId: string, setId: string) => {
      set((state) => {
        const exerciseIndex = state.activeExercises.findIndex(
          (e) => e.exerciseId === exerciseId
        );
        if (exerciseIndex === -1) return state;

        const exercises = [...state.activeExercises];
        const exercise = { ...exercises[exerciseIndex] };
        exercise.sets = exercise.sets.filter((s) => s.id !== setId);

        // Re-number sets
        exercise.sets = exercise.sets.map((s, i) => ({
          ...s,
          setNumber: i + 1,
        }));

        exercises[exerciseIndex] = exercise;
        return { ...state, activeExercises: exercises };
      });
    },

    updateSet: (exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => {
      set((state) => {
        const exerciseIndex = state.activeExercises.findIndex(
          (e) => e.exerciseId === exerciseId
        );
        if (exerciseIndex === -1) return state;

        const exercises = [...state.activeExercises];
        const exercise = { ...exercises[exerciseIndex] };
        const setIndex = exercise.sets.findIndex((s) => s.id === setId);
        if (setIndex === -1) return state;

        exercise.sets = [...exercise.sets];
        exercise.sets[setIndex] = {
          ...exercise.sets[setIndex],
          ...updates,
        };

        exercises[exerciseIndex] = exercise;
        return { ...state, activeExercises: exercises };
      });
    },

    setRestTimer: (seconds: number) => {
      set({ restTimer: seconds });
    },

    decrementRest: () => {
      set((state) => {
        if (state.restTimer <= 0) return state;
        return { restTimer: state.restTimer - 1 };
      });
    },
  }))
);

export default useWorkoutStore;
