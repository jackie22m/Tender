import 'dotenv/config'; // Load environment variables
import express, { Express } from 'express';
import { createHabit, getHabits } from './controllers/habits.js';
import { completionLog } from './controllers/logs.js';
import { createPet, getPet, getPets, releasePet, updatePetName } from './controllers/pets.js';
const app: Express = express();

app.use(express.json());

// --- Your routes will go below this line ---
// Pets
app.post('/pets', createPet);
app.get('/pets', getPets);
app.get('/pets/:petId', getPet);
app.put('/pets/:petId', updatePetName);
app.delete('/pets/:petId', releasePet);

// Habits
app.post('/pets/:petId/habits', createHabit);
app.get('/pets/:petId/habits', getHabits);

// Logs
app.post('/pets/:petId/logs', completionLog);

// --- Your routes will go above this line ---

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Tender listening on http://localhost:${PORT}`);
});
