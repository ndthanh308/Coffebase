-- About Us (Team) schema
-- Single-table approach: store group intro + member cards in one table

CREATE TABLE IF NOT EXISTS about_us (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('group', 'member')),

    -- For type='group':
    --   name = team name (e.g. 'Newbie Coders')
    --   description = group intro text
    -- For type='member':
    --   name = member full name
    --   title = member position/title
    --   roles = array of roles
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    roles TEXT[],
    description TEXT,
    motto TEXT,
    image_url TEXT,

    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure a stable natural key so we can UPSERT by (type, name)
CREATE UNIQUE INDEX IF NOT EXISTS uq_about_us_type_name ON about_us(type, name);

CREATE INDEX IF NOT EXISTS idx_about_us_type ON about_us(type);
CREATE INDEX IF NOT EXISTS idx_about_us_is_active ON about_us(is_active);
CREATE INDEX IF NOT EXISTS idx_about_us_sort_order ON about_us(sort_order);
