# Coverage Improvement Plan

## Current Status (Backend)
- **Overall Coverage**: 35.78% statements, 21.85% branches, 37.43% functions, 35.91% lines
- **Frontend Coverage**: Not yet measured
- **Test Pass Rate**: 93.2% (398/427 tests)

## Coverage Gaps by Priority

### 🔴 CRITICAL - Controllers (0-5% coverage)
Current coverage is extremely low. Controllers handle all API endpoints and business logic.

**Files:**
1. `analyticsController.ts` - **0% coverage**
2. `notificationController.ts` - **0% coverage**
3. `animalController.ts` - **4.58% coverage**
4. `cropController.ts` - **4.69% coverage**
5. `equipmentController.ts` - Need to check
6. `farmController.ts` - Need to check
7. `userController.ts` - Need to check

**Required Tests:**
- HTTP request/response handling
- Authentication & authorization
- Input validation
- Error handling (400, 401, 403, 404, 500)
- Database operations (CRUD)
- Service integration
- Edge cases

**Estimated Effort**: 150-200 new integration tests
**Priority**: P0 (Highest)
**Target**: 60-70% coverage per controller

---

### 🟠 HIGH - Models (40-50% coverage)
Models have partial coverage but missing validation, hooks, and methods.

**Files:**
1. `BreedingRecord.ts` - **0% coverage**
2. `Crop.ts` - **41.66% coverage**
3. `User.ts` - **45.16% coverage**
4. `Animal.ts` - **45.9% coverage**
5. `Farm.ts` - **53.57% coverage**

**Required Tests:**
- Schema validation rules
- Virtual properties
- Instance methods
- Static methods
- Pre/post hooks (save, remove, update)
- Index validation
- Default values
- Required fields

**Estimated Effort**: 60-80 new unit tests
**Priority**: P1
**Target**: 65-70% coverage per model

---

### 🟡 MEDIUM - Middleware (Mixed coverage)
Some middleware well-covered, others completely untested.

**Files:**
1. `notFoundHandler.ts` - **0% coverage**
2. `errorHandler.ts` - **76.19% branches** (close to target!)
3. `auth.ts` - Need to check
4. `validation.ts` - Need to check

**Required Tests:**
- Error scenarios
- Edge cases
- Invalid inputs
- Authentication failures
- Authorization failures
- Malformed requests

**Estimated Effort**: 20-30 new tests
**Priority**: P2
**Target**: 80-85% coverage per middleware

---

### 🟢 GOOD - Services & Utils
These areas already have decent coverage but can improve.

**Well-Covered:**
- `logger.ts` - Good coverage
- Some service files - 50-70% coverage

**Required Tests:**
- Edge cases
- Error handling
- Integration scenarios

**Estimated Effort**: 30-40 new tests
**Priority**: P3
**Target**: 75-80% coverage

---

## Coverage Improvement Roadmap

### Phase 1: Critical Controllers (Week 1-2)
**Objective**: Get controllers from 0-5% to 40-50%

1. **Animal Controller** (Priority: Immediate)
   - [ ] Test `createAnimal` endpoint
   - [ ] Test `getAnimals` with filters
   - [ ] Test `getAnimalById`
   - [ ] Test `updateAnimal`
   - [ ] Test `deleteAnimal`
   - [ ] Test `addHealthRecord`
   - [ ] Test authentication failures
   - [ ] Test authorization failures
   - [ ] Test input validation errors
   - Estimated: 25-30 tests

2. **Crop Controller** (Priority: Immediate)
   - [ ] Test `createCrop` endpoint
   - [ ] Test `getCrops` with filters
   - [ ] Test `getCropById`
   - [ ] Test `updateCrop`
   - [ ] Test `deleteCrop`
   - [ ] Test `addPlanting`
   - [ ] Test `addHarvest`
   - [ ] Test authentication failures
   - [ ] Test input validation errors
   - Estimated: 25-30 tests

3. **Notification Controller** (Priority: High)
   - [ ] Test `createNotification`
   - [ ] Test `getNotifications`
   - [ ] Test `markAsRead`
   - [ ] Test `deleteNotification`
   - [ ] Test filtering & pagination
   - Estimated: 15-20 tests

4. **Analytics Controller** (Priority: High)
   - [ ] Test `getFarmAnalytics`
   - [ ] Test `getCropAnalytics`
   - [ ] Test `getAnimalAnalytics`
   - [ ] Test date range filtering
   - [ ] Test aggregation logic
   - Estimated: 20-25 tests

**Phase 1 Target**: 40-50% controller coverage
**Expected Tests**: 85-105 new tests

---

### Phase 2: Model Coverage (Week 2-3)
**Objective**: Get models from 40-50% to 65-70%

1. **BreedingRecord Model** (0% → 65%)
   - [ ] Test schema validation
   - [ ] Test required fields
   - [ ] Test relationships (parent/offspring)
   - [ ] Test virtual properties
   - [ ] Test instance methods
   - Estimated: 10-12 tests

2. **Crop Model** (41.66% → 65%)
   - [ ] Test planting validation
   - [ ] Test harvest calculations
   - [ ] Test growth stage logic
   - [ ] Test yield predictions
   - [ ] Test instance methods
   - Estimated: 10-12 tests

3. **User Model** (45.16% → 65%)
   - [ ] Test password hashing
   - [ ] Test password comparison
   - [ ] Test token generation
   - [ ] Test role validation
   - [ ] Test unique constraints
   - Estimated: 10-12 tests

4. **Animal Model** (45.9% → 65%)
   - [ ] Test health record validation
   - [ ] Test breeding record relationships
   - [ ] Test age calculations
   - [ ] Test status transitions
   - Estimated: 10-12 tests

**Phase 2 Target**: 65-70% model coverage
**Expected Tests**: 40-48 new tests

---

### Phase 3: Middleware & Services (Week 3-4)
**Objective**: Strengthen error handling and auth coverage

1. **Middleware Tests**
   - [ ] `notFoundHandler` - test 404 scenarios
   - [ ] `errorHandler` - test all error types
   - [ ] `auth` - test token validation failures
   - [ ] `validation` - test malformed inputs
   - Estimated: 15-20 tests

2. **Service Integration Tests**
   - [ ] Test service error handling
   - [ ] Test external API failures
   - [ ] Test database connection issues
   - [ ] Test transaction rollbacks
   - Estimated: 15-20 tests

**Phase 3 Target**: 75-80% middleware/service coverage
**Expected Tests**: 30-40 new tests

---

### Phase 4: Frontend Coverage (Week 4)
**Objective**: Measure and improve frontend coverage

1. **Measure Baseline**
   - [ ] Run frontend coverage report
   - [ ] Identify gaps
   - [ ] Prioritize components

2. **Fix Test Interference**
   - [ ] Fix AnimalsManagement test isolation (8 failing)
   - [ ] Fix App.test.tsx parse error
   - [ ] Improve test cleanup

3. **Component Coverage**
   - [ ] Test uncovered components
   - [ ] Test edge cases
   - [ ] Test accessibility

**Phase 4 Target**: 70%+ frontend coverage
**Expected Tests**: 50-70 new tests

---

## Progressive Coverage Targets

### Milestone 1: Baseline Enforcement (Current)
- **Global**: 40% statements, 30% branches
- **Controllers**: 30% statements
- **Models**: 45% statements
- **Middleware**: 70% statements
- **Services**: 60% statements

### Milestone 2: Production Minimum (Week 3)
- **Global**: 55% statements, 45% branches
- **Controllers**: 50% statements
- **Models**: 60% statements
- **Middleware**: 80% statements
- **Services**: 70% statements

### Milestone 3: Production Standard (Week 4)
- **Global**: 70% statements, 60% branches
- **Controllers**: 65% statements
- **Models**: 70% statements
- **Middleware**: 85% statements
- **Services**: 75% statements

### Milestone 4: Excellence (Long-term)
- **Global**: 80% statements, 70% branches
- **Controllers**: 75% statements
- **Models**: 75% statements
- **Middleware**: 90% statements
- **Services**: 85% statements

---

## Testing Strategy

### Controller Integration Tests
```typescript
describe('AnimalController', () => {
  describe('POST /api/animals', () => {
    it('should create animal with valid data', async () => {
      const response = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${token}`)
        .send(validAnimalData);
      
      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('_id');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidAnimalData);
      
      expect(response.status).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/animals')
        .send(validAnimalData);
      
      expect(response.status).toBe(401);
    });
  });
});
```

### Model Unit Tests
```typescript
describe('Animal Model', () => {
  it('should validate required fields', async () => {
    const animal = new Animal({});
    
    await expect(animal.save()).rejects.toThrow();
  });

  it('should calculate age correctly', () => {
    const animal = new Animal({
      dateOfBirth: new Date('2020-01-01'),
      // ... other required fields
    });
    
    expect(animal.age).toBeGreaterThan(3);
  });
});
```

---

## Success Metrics

### Coverage Metrics
- [ ] Backend global coverage: 40% → 70%
- [ ] Controller coverage: 5% → 65%
- [ ] Model coverage: 45% → 70%
- [ ] Frontend coverage: TBD → 70%

### Test Quality Metrics
- [ ] Test pass rate: 93.2% → 98%+
- [ ] Test isolation: Fix all interference issues
- [ ] Test performance: All tests < 30 seconds
- [ ] No flaky tests

### CI/CD Integration
- [ ] Coverage reports in CI
- [ ] Coverage thresholds enforced
- [ ] Failed builds on threshold violations
- [ ] Coverage badges in README
- [ ] Coverage trends tracked

---

## Tools & Commands

### Generate Coverage Report
```bash
# Backend
cd farm-management-backend
npm test -- --coverage --watchAll=false

# Frontend
cd web-dashboard
npm test -- --coverage --watchAll=false
```

### View HTML Coverage Report
```bash
# Backend
start coverage/lcov-report/index.html

# Frontend
start coverage/lcov-report/index.html
```

### Run Specific Test Suites
```bash
# Controllers only
npm test -- controllers

# Models only
npm test -- models

# Specific file
npm test -- animalController.test.ts
```

### Watch Mode for Development
```bash
npm test -- --watch --coverage
```

---

## Next Steps

1. **Immediate** (Today)
   - [x] Create coverage improvement plan
   - [x] Set realistic progressive thresholds
   - [ ] Measure frontend coverage baseline
   - [ ] Start writing controller integration tests

2. **This Week**
   - [ ] Complete Animal Controller tests (25-30 tests)
   - [ ] Complete Crop Controller tests (25-30 tests)
   - [ ] Reach 40% controller coverage milestone
   - [ ] Fix AnimalsManagement test interference

3. **Next Week**
   - [ ] Complete Notification & Analytics controllers
   - [ ] Improve model coverage (BreedingRecord, User, Animal)
   - [ ] Reach 50% overall coverage milestone

4. **Week 3-4**
   - [ ] Complete all controller tests
   - [ ] Strengthen middleware coverage
   - [ ] Frontend coverage improvement
   - [ ] Reach 70% overall coverage milestone

---

## Notes

- **Current Focus**: Controllers are the biggest gap and highest priority
- **Quick Wins**: errorHandler middleware already at 76% - just needs edge cases
- **Frontend**: Unknown coverage - need baseline measurement
- **Test Quality**: 93% pass rate is good, but test interference needs fixing
- **CI Integration**: Coverage enforcement will prevent regressions
- **Long-term**: Aim for 80%+ coverage across the board

---

**Last Updated**: 2025-01-XX
**Status**: In Progress - Phase 1
**Overall Progress**: 35% → Target 70%
