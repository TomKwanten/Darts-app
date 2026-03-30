const BASE_URL = 'http://localhost:8000/api';

export async function getPlayers() {
  const response = await fetch(`${BASE_URL}/players`);
  if (!response.ok) throw new Error('Failed to fetch players');
  return response.json();
}

export async function createPlayer(name) {
  const response = await fetch(`${BASE_URL}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error('Failed to create player');
  return response.json();
}

export async function saveGame(gameData) {
  const response = await fetch(`${BASE_URL}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameData),
  });
  if (!response.ok) throw new Error('Failed to save game');
  return response.json();
}