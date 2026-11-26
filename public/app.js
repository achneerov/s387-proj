let token = '';
const output = document.querySelector('#response');

async function request(path, method = 'GET', body, key) {
  try {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body) headers['Content-Type'] = 'application/json';
    if (key) headers['Idempotency-Key'] = key;
    const response = await fetch(`/api/v1${path}`, {
      method, headers, body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json();
    output.textContent = `${method} ${path}\nHTTP ${response.status}\n${JSON.stringify(data, null, 2)}`;
    return response.ok ? data : null;
  } catch (error) {
    output.textContent = error.message;
    return null;
  }
}

document.querySelector('#login').addEventListener('submit', async (event) => {
  event.preventDefault();
  token = '';
  document.querySelector('#account').textContent = 'Not logged in.';
  document.querySelector('#status').elements.reservationId.value = '';
  const form = event.currentTarget.elements;
  const email = form.email.value;
  const data = await request('/auth/login', 'POST', { email, password: form.password.value });
  if (data) {
    token = data.accessToken;
    document.querySelector('#account').textContent = `Logged in as ${email}.`;
  }
});

document.querySelector('#equipment').addEventListener('click', async () => {
  const data = await request('/equipment');
  if (data) {
    document.querySelector('#equipment-list').replaceChildren(
      ...data.items.map((item) => new Option(item.name, item.id))
    );
  }
});

document.querySelector('#booking').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget.elements;
  const data = await request(`/equipment/${form.equipmentId.value}/reservations`, 'POST', {
    startsAt: new Date(form.startsAt.value).toISOString(),
    endsAt: new Date(form.endsAt.value).toISOString()
  }, form.key.value);
  if (data) document.querySelector('#status').elements.reservationId.value = data.id;
});

document.querySelector('#reservations').addEventListener('click', () => request('/me/reservations'));

document.querySelector('#status').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget.elements;
  await request(`/reservations/${encodeURIComponent(form.reservationId.value)}`, 'PATCH', {
    status: form.status.value
  }, form.key.value);
});

document.querySelectorAll('[data-new-key]').forEach((button) => {
  const input = document.getElementById(button.dataset.newKey);
  input.value = crypto.randomUUID();
  button.addEventListener('click', () => { input.value = crypto.randomUUID(); });
});
