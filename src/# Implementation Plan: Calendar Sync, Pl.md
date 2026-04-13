# Implementation Plan: Calendar Sync, Planning Details, Swap Exercise, and Workout Effort

## Objective
Implement three core features based on the user's feedback:
1. **Sync Planning with Calendar**: Show the planned weekly workouts in the Calendar tab and add date details to the Planning tab to clarify which day is which.
2. **Swap Exercise Feature**: Allow users to replace an exercise during an active workout with a similar one (e.g., if they lack equipment or don't know the exercise), utilizing AI.
3. **Post-Workout Evaluation**: Ask for an effort rating (e.g., scale of 1-5) before finishing a workout.

## Key Files & Context
- `src/App.jsx`: Contains the entire state, views (`renderPlanner`, `renderCalendarView`, `renderWorkoutLogger`), and business logic for the application.

## Implementation Steps

### 1. Update Imports & State
- Add `RefreshCw` to the `lucide-react` import.
- Add new state variables in `App.jsx`:
  - `const [swapLoadingIdx, setSwapLoadingIdx] = useState(null);`
  - `const [workoutEffort, setWorkoutEffort] = useState(null);`

### 2. Feature 1: Calendar Sync & Planning Details
- **In `renderPlanner`**:
  - Calculate the current date for each day of the week to display alongside the weekday name (e.g., "Segunda (13/04)").
  - Highlight the current day (`isToday`).
- **In `renderCalendarView`**:
  - For each day in the calendar grid, determine its weekday (0-6).
  - Check `weeklyPlan[dayOfWeek]` to see if a workout is planned.
  - If a workout is planned but not yet logged (`!hasWorkout`), display an indicator (e.g., a dashed border with the modality's color or a small hollow dot) to show it's scheduled.

### 3. Feature 2: Swap Exercise (Trocar Exercício)
- Create `swapExercise(index)` function:
  - Takes the index of the exercise to swap.
  - Calls Gemini API with a prompt asking for an alternative exercise targeting the same muscle group, sets, and reps.
  - Updates the specific exercise in the `currentWorkout.exercises` state array.
- **In `renderWorkoutLogger`**:
  - Add a button (using `RefreshCw` icon) next to each exercise name.
  - Show a loading state (spinner or disabled state) when `swapLoadingIdx === idx`.

### 4. Feature 3: Post-Workout Evaluation
- Define an effort scale array (e.g., 1-5 with labels and emojis like 🥱, 🙂, 😅, 🥵, 💀).
- **In `startWorkout`**:
  - Reset `setWorkoutEffort(null)` when starting a new workout.
- **In `renderWorkoutLogger`**:
  - Above the "Finalizar Treino" button, render a section "Como foi o treino?" with the effort scale buttons.
- **In `finishWorkout`**:
  - Validate that `workoutEffort` is selected (alert if not).
  - Include `effort: workoutEffort` in the object saved to Firestore.
  - Reset `workoutEffort` to `null` after saving.

## Verification & Testing
- Ensure the Weekly Plan updates reflect accurately on the Calendar, showing past, present, and future planned workouts visually distinct from completed ones.
- Test swapping an exercise during a mock workout to confirm the Gemini API returns valid JSON and updates the UI without losing the other exercises.
- Ensure finishing a workout requires selecting an effort level and that it successfully logs to the `history` and resets state correctly.