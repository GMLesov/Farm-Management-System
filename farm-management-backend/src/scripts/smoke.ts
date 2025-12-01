/*
  Smoke test script: runs a tiny end-to-end flow against the Express app directly
  - Uses in-memory MongoDB (no Docker needed)
  - Steps: register → create farm → add animal → list animals
*/

process.env.USE_INMEMORY_DB = process.env.USE_INMEMORY_DB || 'true';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.ALLOW_START_WITHOUT_DB = 'false';
process.env.ALLOW_START_WITHOUT_REDIS = 'true';

import request from 'supertest';
import app from '@/server';

async function run() {
  try {
    const unique = Date.now();
    const email = `smoke+${unique}@example.com`;
    const password = 'Passw0rd!';

    // 1) Register
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ email, password, firstName: 'Smoke', lastName: 'Test' })
      .expect(201);

    const token = regRes.body.token as string;
    if (!token) throw new Error('No token returned from register');

    // 2) Create farm
    const farmRes = await request(app)
      .post('/api/farms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Smoke Farm',
        description: 'Smoke test farm',
        location: {
          address: '123 Country Rd', city: 'Springfield', state: 'CA', country: 'USA', zipCode: '90210',
          latitude: 34.0901, longitude: -118.4065,
        },
        size: 125,
        soilType: 'loam',
        climateZone: 'Mediterranean',
      })
      .expect(201);

    const farmId = farmRes.body?.data?.id;
    if (!farmId) throw new Error('No farmId returned');

    // 3) Add animal
    const animalRes = await request(app)
      .post('/api/animals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        farmId,
        identificationNumber: `SMOKE-${unique}`,
        name: 'Bella',
        species: 'cattle',
        breed: 'Holstein',
        gender: 'female',
        dateOfBirth: '2021-01-01',
        feedingSchedule: { feedType: 'hay', quantity: 4, frequency: 2 },
      })
      .expect(201);

    const animalId = animalRes.body?.data?.id;
    if (!animalId) throw new Error('No animal id returned');

    // 4) List animals
    const listRes = await request(app)
      .get(`/api/animals?farmId=${farmId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const count = listRes.body?.count;

    // Summary
    // eslint-disable-next-line no-console
    console.log('SMOKE OK', {
      email,
      token: token.substring(0, 16) + '...',
      farmId,
      animalId,
      animalsCount: count,
    });

    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('SMOKE FAIL', err);
    process.exit(1);
  }
}

run();
