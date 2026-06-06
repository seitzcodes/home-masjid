-- Migration for Phase 6: Inter-Masjid Networking

CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE message_type AS ENUM ('standard', 'speaker_invite');

-- Connections Table
CREATE TABLE IF NOT EXISTS home_masjid.masjid_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_masjid_id UUID NOT NULL REFERENCES home_masjid.masjids(id) ON DELETE CASCADE,
    receiver_masjid_id UUID NOT NULL REFERENCES home_masjid.masjids(id) ON DELETE CASCADE,
    status connection_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (requester_masjid_id, receiver_masjid_id)
);

ALTER TABLE home_masjid.masjid_connections ENABLE ROW LEVEL SECURITY;

-- Messages Table
CREATE TABLE IF NOT EXISTS home_masjid.masjid_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES home_masjid.masjid_connections(id) ON DELETE CASCADE,
    sender_masjid_id UUID NOT NULL REFERENCES home_masjid.masjids(id) ON DELETE CASCADE,
    receiver_masjid_id UUID NOT NULL REFERENCES home_masjid.masjids(id) ON DELETE CASCADE,
    msg_type message_type NOT NULL DEFAULT 'standard',
    subject TEXT,
    body TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE home_masjid.masjid_messages ENABLE ROW LEVEL SECURITY;

-- Function to check if a user is faculty for a specific masjid
CREATE OR REPLACE FUNCTION home_masjid.is_faculty_member(check_masjid_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM home_masjid.masjid_faculty
    WHERE masjid_id = check_masjid_id AND user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for masjid_connections
CREATE POLICY "Faculty can view their masjid's connections"
    ON home_masjid.masjid_connections FOR SELECT
    USING (
        home_masjid.is_faculty_member(requester_masjid_id, auth.uid()) OR
        home_masjid.is_faculty_member(receiver_masjid_id, auth.uid())
    );

CREATE POLICY "Faculty can create connections for their masjid"
    ON home_masjid.masjid_connections FOR INSERT
    WITH CHECK (
        home_masjid.is_faculty_member(requester_masjid_id, auth.uid())
    );

CREATE POLICY "Faculty can update their masjid's received connections"
    ON home_masjid.masjid_connections FOR UPDATE
    USING (
        home_masjid.is_faculty_member(receiver_masjid_id, auth.uid())
    );

-- RLS Policies for masjid_messages
CREATE POLICY "Faculty can view their masjid's messages"
    ON home_masjid.masjid_messages FOR SELECT
    USING (
        home_masjid.is_faculty_member(sender_masjid_id, auth.uid()) OR
        home_masjid.is_faculty_member(receiver_masjid_id, auth.uid())
    );

CREATE POLICY "Faculty can send messages from their masjid"
    ON home_masjid.masjid_messages FOR INSERT
    WITH CHECK (
        home_masjid.is_faculty_member(sender_masjid_id, auth.uid())
    );

CREATE POLICY "Faculty can update read status of received messages"
    ON home_masjid.masjid_messages FOR UPDATE
    USING (
        home_masjid.is_faculty_member(receiver_masjid_id, auth.uid())
    );

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_connections_requester ON home_masjid.masjid_connections(requester_masjid_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver ON home_masjid.masjid_connections(receiver_masjid_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON home_masjid.masjid_messages(sender_masjid_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON home_masjid.masjid_messages(receiver_masjid_id);
