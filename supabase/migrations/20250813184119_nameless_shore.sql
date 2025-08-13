/*
  # Expense Batch Management System Database Schema

  1. New Tables
    - `batches`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text, batch name)
      - `opening_balance` (decimal, starting balance)
      - `start_date` (date, batch start date)
      - `end_date` (date, batch end date)
      - `total_expense` (decimal, calculated total expenses)
      - `closing_balance` (decimal, calculated closing balance)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `batch_id` (uuid, references batches)
      - `date` (date, transaction date)
      - `particulars` (text, transaction description)
      - `amount` (decimal, transaction amount)
      - `place` (text, transaction location)
      - `remarks` (text, optional notes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Users can only access batches and transactions they own

  3. Indexes
    - Index on user_id for batches
    - Index on batch_id for transactions
    - Index on date for transactions (for sorting)
*/

-- Create batches table
CREATE TABLE IF NOT EXISTS batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  opening_balance decimal(12,2) NOT NULL DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_expense decimal(12,2) NOT NULL DEFAULT 0,
  closing_balance decimal(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT valid_opening_balance CHECK (opening_balance >= 0)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  particulars text NOT NULL,
  amount decimal(12,2) NOT NULL,
  place text NOT NULL,
  remarks text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_amount CHECK (amount > 0)
);

-- Enable Row Level Security
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for batches
CREATE POLICY "Users can view their own batches"
  ON batches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own batches"
  ON batches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own batches"
  ON batches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own batches"
  ON batches
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for transactions
CREATE POLICY "Users can view transactions in their batches"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM batches 
      WHERE batches.id = transactions.batch_id 
      AND batches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transactions in their batches"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM batches 
      WHERE batches.id = transactions.batch_id 
      AND batches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update transactions in their batches"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM batches 
      WHERE batches.id = transactions.batch_id 
      AND batches.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM batches 
      WHERE batches.id = transactions.batch_id 
      AND batches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete transactions in their batches"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM batches 
      WHERE batches.id = transactions.batch_id 
      AND batches.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_batches_user_id ON batches(user_id);
CREATE INDEX IF NOT EXISTS idx_batches_created_at ON batches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_batch_id ON transactions(batch_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);

-- Create function to update batch totals when transactions change
CREATE OR REPLACE FUNCTION update_batch_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the batch totals
  UPDATE batches 
  SET 
    total_expense = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM transactions 
      WHERE batch_id = COALESCE(NEW.batch_id, OLD.batch_id)
    ),
    closing_balance = opening_balance - (
      SELECT COALESCE(SUM(amount), 0) 
      FROM transactions 
      WHERE batch_id = COALESCE(NEW.batch_id, OLD.batch_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.batch_id, OLD.batch_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update batch totals
CREATE TRIGGER trigger_update_batch_totals_insert
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_totals();

CREATE TRIGGER trigger_update_batch_totals_update
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_totals();

CREATE TRIGGER trigger_update_batch_totals_delete
  AFTER DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_totals();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER trigger_batches_updated_at
  BEFORE UPDATE ON batches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();