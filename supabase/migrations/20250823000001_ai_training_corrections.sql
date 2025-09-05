-- AI Training Corrections Table
-- Stores human corrections for AI extractions to improve accuracy over time

CREATE TABLE ai_training_corrections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_record_id uuid REFERENCES delivery_records(id) ON DELETE CASCADE,
    client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Original AI extraction data
    original_extraction jsonb NOT NULL,
    original_confidence_scores jsonb,
    
    -- Human corrections
    corrected_extraction jsonb NOT NULL,
    correction_type text NOT NULL CHECK (correction_type IN ('correct', 'wrong', 'missing')),
    fields_corrected text[] DEFAULT '{}',
    
    -- Training metadata
    review_time_seconds integer,
    reviewer_confidence text CHECK (reviewer_confidence IN ('high', 'medium', 'low')),
    notes text,
    
    -- Tracking
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_training_corrections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view training corrections for their client"
    ON ai_training_corrections FOR SELECT
    USING (
        client_id IN (
            SELECT cu.client_id 
            FROM client_users cu 
            WHERE cu.user_id = auth.uid() 
            AND cu.status = 'active'
        )
    );

CREATE POLICY "Users can create training corrections for their client"
    ON ai_training_corrections FOR INSERT
    WITH CHECK (
        client_id IN (
            SELECT cu.client_id 
            FROM client_users cu 
            WHERE cu.user_id = auth.uid() 
            AND cu.status = 'active'
        )
    );

CREATE POLICY "Users can update their own training corrections"
    ON ai_training_corrections FOR UPDATE
    USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_training_corrections_delivery_record 
    ON ai_training_corrections(delivery_record_id);
    
CREATE INDEX idx_training_corrections_client 
    ON ai_training_corrections(client_id);
    
CREATE INDEX idx_training_corrections_correction_type 
    ON ai_training_corrections(correction_type);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_training_corrections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_training_corrections_updated_at
    BEFORE UPDATE ON ai_training_corrections
    FOR EACH ROW
    EXECUTE FUNCTION update_training_corrections_updated_at();

-- Training analytics view
CREATE VIEW ai_training_analytics AS
SELECT 
    client_id,
    correction_type,
    COUNT(*) as correction_count,
    AVG(review_time_seconds) as avg_review_time,
    COUNT(DISTINCT delivery_record_id) as unique_documents,
    AVG(
        CASE 
            WHEN correction_type = 'correct' THEN 100
            WHEN correction_type = 'wrong' THEN 0  
            WHEN correction_type = 'missing' THEN 50
            ELSE 0
        END
    ) as accuracy_score
FROM ai_training_corrections
GROUP BY client_id, correction_type;

COMMENT ON TABLE ai_training_corrections IS 'Stores human corrections for AI extractions to improve Document AI accuracy over time';
COMMENT ON VIEW ai_training_analytics IS 'Analytics view showing AI accuracy and training progress by client';