import { Request, Response } from 'express';
import { Habit } from '../entities/Habit.js';
import { habitIdCounter, habits } from '../models/habits.js';
import { pets } from '../models/pets.js';
import { CreateHabitSchema } from '../validators/habits.js';
import { isPetCooked } from './pets.js';

export function createHabit(req: Request, res: Response): void {
  const petId = Number(req.params.petId);
  const pet = pets.find((p) => p.id === petId);

  if (!pet) {
    res.status(404).json({ message: 'Pet not found' });
    return;
  }

  //if pet is cooked
  if (isPetCooked(pet)) {
    res.status(400).json({ message: 'This pet has been cooked. Adopt a new one.' });
    return;
  }

  const result = CreateHabitSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: result.error });
    return;
  }
  const newHabit: Habit = {
    id: habitIdCounter.value++,
    petId: petId,
    name: result.data.name,
    category: result.data.category,
    targetFrequency: result.data.targetFrequency,
    statBoost: result.data.statBoost,
  };
  habits.push(newHabit);
  res.status(201).json(newHabit);
}

export function getHabits(req: Request, res: Response): void {
  const petId = Number(req.params.petId);
  const pet = pets.find((p) => p.id === petId);
  if (!pet) {
    res.status(404).json({ message: 'Pet not found.' });
    return;
  }

  let result = habits.filter((h) => h.petId === petId);

  const { category } = req.query;
  if (category) {
    result = result.filter((p) => p.category === category); // filtered by category
  }

  res.status(200).json(result);
}
