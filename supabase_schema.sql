-- Function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. app_config
CREATE TABLE IF NOT EXISTS app_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_app_config_updated_at ON app_config;
CREATE TRIGGER update_app_config_updated_at
    BEFORE UPDATE ON app_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. ropa
CREATE TABLE IF NOT EXISTS ropa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    brand VARCHAR(100),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    gender VARCHAR(50),
    sizes TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    material VARCHAR(100),
    image_urls TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_ropa_updated_at ON ropa;
CREATE TRIGGER update_ropa_updated_at
    BEFORE UPDATE ON ropa
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. suplementos
CREATE TABLE IF NOT EXISTS suplementos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    brand VARCHAR(100),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    weight VARCHAR(50),
    flavor VARCHAR(100),
    type VARCHAR(100),
    nutritional_info JSONB,
    image_urls TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_suplementos_updated_at ON suplementos;
CREATE TRIGGER update_suplementos_updated_at
    BEFORE UPDATE ON suplementos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. maquinas
CREATE TABLE IF NOT EXISTS maquinas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    brand VARCHAR(100),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    type VARCHAR(100),
    dimensions VARCHAR(100),
    weight_capacity VARCHAR(50),
    features TEXT[] DEFAULT '{}',
    image_urls TEXT[] DEFAULT '{}',
    video_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_maquinas_updated_at ON maquinas;
CREATE TRIGGER update_maquinas_updated_at
    BEFORE UPDATE ON maquinas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
