# Database Schema for Test Assignment Feature

## New Table: test_assignments

Execute this SQL in your Supabase SQL Editor:

```sql
-- Create test_assignments table
CREATE TABLE IF NOT EXISTS test_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_suite_id UUID NOT NULL REFERENCES test_suites(id) ON DELETE CASCADE,
  tester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'assigned',
  due_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(test_suite_id, tester_id)
);

-- Create index for faster queries
CREATE INDEX idx_test_assignments_tester ON test_assignments(tester_id);
CREATE INDEX idx_test_assignments_suite ON test_assignments(test_suite_id);
CREATE INDEX idx_test_assignments_status ON test_assignments(status);

-- Enable Row Level Security
ALTER TABLE test_assignments ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage all assignments
CREATE POLICY "Admins can manage all assignments"
ON test_assignments
FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Policy for testers to view their own assignments
CREATE POLICY "Testers can view their assignments"
ON test_assignments
FOR SELECT
USING (
  tester_id = auth.uid()
  OR
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Policy for testers to update status of their assignments
CREATE POLICY "Testers can update their assignment status"
ON test_assignments
FOR UPDATE
USING (tester_id = auth.uid())
WITH CHECK (tester_id = auth.uid());

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_test_assignments_updated_at
BEFORE UPDATE ON test_assignments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## Status Values

The `status` field can have the following values:
- `assigned` - Test has been assigned but not started
- `in_progress` - Tester is currently working on the test
- `completed` - Test has been completed
- `cancelled` - Assignment has been cancelled

## Table Relationships

```
test_assignments
  ├── test_suite_id → test_suites.id
  ├── tester_id → auth.users.id (profiles)
  └── assigned_by → auth.users.id (profiles)
```

## Instructions

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL code above
4. Run the query to create the table and policies
5. Verify the table was created in the Table Editor
