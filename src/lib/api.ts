const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchPurchases() {
  const response = await fetch(`${API_BASE_URL}/purchases`);
  if (!response.ok) throw new Error('Failed to fetch purchases');
  return response.json();
}

export async function createPurchase(data: any) {
  const response = await fetch(`${API_BASE_URL}/purchases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create purchase');
  return response.json();
}

export async function updatePurchase(id: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/purchases/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update purchase');
  return response.json();
}

export async function login(username: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) throw new Error('Invalid credentials');
  return response.json();
}