# Database Schema Management Strategy

## Current Status
- **Development**: Using fresh schema drops for rapid iteration
- **Next Phase**: Implement versioned, non-destructive migrations
- **Production**: Zero-downtime migration strategy required

## Migration Strategy

### 1. Version-Controlled Migrations

**File Structure:**
```
migrations/
├── 001_initial_schema.sql
├── 002_add_batch_tracking.sql
├── 003_add_shopify_integration.sql
├── 004_add_notification_tables.sql
└── rollbacks/
    ├── 001_rollback.sql
    ├── 002_rollback.sql
    └── ...
```

**Naming Convention:**
- `{version}_{description}.sql`
- Sequential numbering (001, 002, 003...)
- Descriptive, lowercase with underscores
- Never edit existing migration files

### 2. Supabase Migration Management

**Option A: Supabase CLI (Recommended)**
```bash
# Initialize migrations
supabase init

# Create new migration
supabase migration new add_batch_tracking

# Apply migrations
supabase db push

# Reset (development only)
supabase db reset
```

**Option B: Custom Migration Table**
```sql
-- Track applied migrations
CREATE TABLE schema_migrations (
    version VARCHAR(20) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT NOW(),
    description TEXT
);
```

### 3. Migration Types & Strategies

#### **Safe Migrations (No Downtime)**
- ✅ Add new tables
- ✅ Add new columns (with defaults)
- ✅ Add indexes (using CONCURRENTLY)
- ✅ Add constraints (if data already complies)
- ✅ Create new functions/triggers

```sql
-- Example: Add new column safely
ALTER TABLE devices ADD COLUMN location VARCHAR(255) DEFAULT 'Warehouse A';
```

#### **Risky Migrations (Require Planning)**
- ⚠️ Drop columns
- ⚠️ Rename columns/tables
- ⚠️ Change data types
- ⚠️ Add NOT NULL constraints
- ⚠️ Drop tables

#### **Complex Migrations (Multi-Step Process)**
```sql
-- Example: Rename column safely
-- Step 1: Add new column
ALTER TABLE devices ADD COLUMN device_location VARCHAR(255);

-- Step 2: Migrate data
UPDATE devices SET device_location = location;

-- Step 3: Update application code (deploy)

-- Step 4: Drop old column (separate migration)
ALTER TABLE devices DROP COLUMN location;
```

### 4. Production Migration Workflow

#### **Pre-Migration Checklist**
- [ ] Test migration on staging environment
- [ ] Verify data integrity after migration
- [ ] Estimate migration duration
- [ ] Plan rollback strategy
- [ ] Schedule maintenance window (if needed)
- [ ] Backup critical data
- [ ] Update application code if needed

#### **Migration Execution**
```bash
# 1. Backup before migration
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Apply migration in transaction
BEGIN;
-- Run migration script
-- Verify results
COMMIT; -- or ROLLBACK if issues

# 3. Verify application functionality
# 4. Monitor for errors
```

### 5. Rollback Strategies

#### **Immediate Rollbacks**
```sql
-- For each migration, create rollback script
-- migrations/rollbacks/003_rollback.sql
ALTER TABLE devices DROP COLUMN IF EXISTS location;
DROP INDEX IF EXISTS idx_devices_location;
```

#### **Point-in-Time Recovery**
- Supabase automatic backups (7 days)
- Custom backup before major changes
- pg_dump for specific tables

### 6. Development Workflow

#### **Feature Development**
1. Create feature branch
2. Create migration file for schema changes
3. Test migration locally
4. Update application code
5. Test end-to-end functionality
6. Create rollback script
7. Submit PR with both migration and rollback

#### **Code Review Process**
- Review migration for safety
- Verify rollback script works
- Check for potential performance impact
- Validate data integrity measures

### 7. Future Tools & Improvements

#### **Supabase Native Features**
```bash
# When available, use Supabase CLI
supabase migration new "add_notification_system"
supabase db diff --schema public
supabase migration squash
```

#### **Schema Validation**
```javascript
// Automated schema validation
const validateSchema = async () => {
  const tables = await checkRequiredTables();
  const columns = await checkRequiredColumns();
  const indexes = await checkPerformanceIndexes();
  return { tables, columns, indexes };
};
```

#### **Migration Testing**
```sql
-- Add to each migration
-- Test data integrity
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM devices) > 0, 'Devices table should not be empty';
  ASSERT (SELECT COUNT(*) FROM devices WHERE serial IS NULL) = 0, 'No devices should have null serials';
END $$;
```

### 8. Emergency Procedures

#### **Migration Failures**
1. **Stop application** if data corruption risk
2. **Assess impact** - which features affected?
3. **Quick rollback** if possible
4. **Point-in-time restore** if necessary
5. **Communicate** with stakeholders
6. **Post-mortem** and process improvement

#### **Performance Issues**
```sql
-- Monitor during migrations
SELECT 
  query,
  calls,
  mean_time,
  total_time
FROM pg_stat_statements 
ORDER BY total_time DESC;
```

### 9. Documentation Requirements

#### **Each Migration Must Include:**
- Purpose and business justification
- Estimated execution time
- Rollback procedure
- Testing steps
- Performance impact assessment
- Dependencies on application code changes

#### **Migration Log Template:**
```markdown
## Migration 005: Add Shopify Integration Tables

**Date:** 2024-01-15
**Estimated Time:** 5 minutes
**Risk Level:** Low

### Changes:
- Add `shopify_orders` table
- Add `webhook_logs` table
- Add indexes for performance

### Rollback:
- Drop tables in reverse order
- See `rollbacks/005_rollback.sql`

### Testing:
- [x] Staging environment
- [x] Data integrity checks
- [x] Performance benchmarks
```

### 10. Monitoring & Alerts

#### **Schema Health Checks**
```sql
-- Weekly schema validation
SELECT 
  schemaname,
  tablename,
  n_tup_ins + n_tup_upd + n_tup_del as activity
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY activity DESC;
```

#### **Performance Monitoring**
- Query performance before/after migrations
- Index usage statistics
- Table bloat monitoring
- Connection pool health

---

## Implementation Timeline

### Phase 1: Foundation (Next 2 weeks)
- [ ] Set up Supabase CLI
- [ ] Create migration file structure
- [ ] Document current schema as migration 001
- [ ] Create rollback procedures

### Phase 2: Process (Month 2)
- [ ] Implement migration testing
- [ ] Create automated backup scripts
- [ ] Set up staging environment mirroring
- [ ] Create emergency procedures

### Phase 3: Advanced (Month 3+)
- [ ] Automated schema validation
- [ ] Performance regression testing
- [ ] Blue-green deployment strategy
- [ ] Advanced monitoring dashboards

---

**Key Principle:** Always assume migrations will be applied to production with live data. Plan accordingly. 