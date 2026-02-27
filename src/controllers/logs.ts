import { Request, Response } from 'express';
import { Log } from '../entities/Log.js';
import { habits } from '../models/habits.js';
import { logIdCounter, logs } from '../models/logs.js';
import { pets } from '../models/pets.js';
import { CreateLogSchema } from '../validators/logs.js';
import { computeStage } from './pets.js';

export function completionLog(req: Request, res: Response): void {
  const petId = Number(req.params.petId);
  const pet = pets.find((p) => p.id === petId);

  if (!pet) {
    res.status(404).json({ message: 'Pet not found' });
    return;
  }
  const stageInfo = computeStage(pet);

  if (stageInfo.stageEmoji == '🍗') {
    res.status(400).json({ message: 'This pet has been cooked. Adopt a new one.' });
    return;
  }

  const result = CreateLogSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: result.error });
    return;
  }

  const { habitId, note } = result.data;
  const habit = habits.find((h) => h.id === habitId);
  // habit does not exist
  if (!habit) {
    res.status(404).json({ message: 'Habit not found' });
    return;
  }
  // habit does not belong to this pet
  if (habit.petId !== petId) {
    res.status(400).json({ message: 'Habit does not belong to this pet.' });
    return;
  }

  const newLog: Log = {
    id: logIdCounter.value++,
    petId: petId,
    habitId: habitId,
    date: new Date().toISOString(),
    note: note,
  };

  logs.push(newLog);

  pet.lastFedAt = new Date(); // updates pet's lastFedAt

  res.status(201).json(newLog);
}
