-- Migration to support multiple proof documents

-- Since proof_documents was originally a string, we can cleanly convert it to a text array.
-- Using string_to_array to handle any existing single-string values gracefully, or NULL if empty.

ALTER TABLE home_masjid.masjid_claims
ALTER COLUMN proof_documents TYPE text[]
USING CASE 
    WHEN proof_documents IS NULL THEN NULL 
    ELSE ARRAY[proof_documents] 
END;
