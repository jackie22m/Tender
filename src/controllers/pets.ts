import { differenceInMilliseconds } from 'date-fns';
import { Request, Response } from 'express';
import { Pet } from '../entities/Pet.js';
import { logs } from '../models/logs.js';
import { petIdCounter, pets } from '../models/pets.js';
import { NEGLECT_THRESHOLD_MS } from '../utils/config.js';
import { CreatePetSchema } from '../validators/pets.js';

export function isPetCooked(pet: Pet): boolean {
  return differenceInMilliseconds(new Date(), pet.lastFedAt) > NEGLECT_THRESHOLD_MS;
}

export function computeStage(pet: Pet): { stage: string; stageEmoji: string } {
  if (isPetCooked(pet)) {
    return { stage: 'Cooked', stageEmoji: '🍗' };
  }
  const petLogs = logs.filter((log) => log.petId === pet.id);
  const totalLogs = petLogs.length;

  if (totalLogs === 0) {
    return { stage: 'Egg', stageEmoji: '🥚' };
  }

  if (totalLogs <= 4) {
    return { stage: 'Hatching', stageEmoji: '🐣' };
  }

  if (totalLogs <= 14) {
    return { stage: 'Growing', stageEmoji: '🐥' };
  }

  return { stage: 'Grown', stageEmoji: '🐓' };
}

export function createPet(req: Request, res: Response): void {
  const result = CreatePetSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: result.error });
    return;
  }

  const newPet: Pet = {
    id: petIdCounter.value++,
    name: result.data.name,
    species: result.data.species,
    happiness: 50,
    hunger: 50,
    energy: 50,
    lastFedAt: new Date(),
  };

  pets.push(newPet);
  res.status(201).json(newPet);
}

export function getPets(req: Request, res: Response): void {
  let result = pets;
  const { species, minHappiness } = req.query;

  if (species) {
    result = result.filter((p) => p.species === species); // filtered by species
  }

  if (minHappiness) {
    const min = Number(minHappiness);
    result = result.filter((p) => p.happiness >= min); // filtered by minHappiness
  }
  res.status(200).json(result);
}

export function getPet(req: Request, res: Response): void {
  const petId = Number(req.params.petId);
  const pet = pets.find((p) => p.id === petId);

  if (!pet) {
    res.status(404).json({ message: 'Pet not found' });
    return;
  }

  const stageInfo = computeStage(pet);
  res.status(200).json({ pet, stage: stageInfo.stage, stageEmoji: stageInfo.stageEmoji });
}

export function updatePetName(req: Request, res: Response): void {
  const petId = Number(req.params.petId);
  const pet = pets.find((p) => p.id === petId);

  if (!pet) {
    res.status(404).json({ message: 'Pet not found' });
    return;
  }
  pet.name = req.body.name;
  res.status(200).json(pet);
}

export function releasePet(req: Request, res: Response): void {
  const petId = Number(req.params.petId);
  const index = pets.findIndex((p) => p.id === petId);

  if (index === -1) {
    res.status(404).json({ message: 'Pet not found' });
    return;
  }
  pets.splice(index, 1);
  res.status(204).send();
}
