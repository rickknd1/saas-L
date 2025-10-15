-- ============================================
-- COMPANION LEGAL SAAS - DATABASE SCHEMA
-- Création manuelle des tables PostgreSQL
-- ============================================

-- Nettoyer les tables existantes (optionnel)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS document_versions CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Types ENUM
CREATE TYPE "Plan" AS ENUM ('FREEMIUM', 'STANDARD');
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PENDING', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');
CREATE TYPE "NotificationType" AS ENUM ('COMMENT', 'MENTION', 'DOCUMENT_UPDATED', 'PROJECT_SHARED', 'TEAM_MEMBER_ADDED', 'SYSTEM');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE', 'TRIALING', 'INCOMPLETE');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE');

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email TEXT UNIQUE NOT NULL,
    email_verified TIMESTAMP,
    name TEXT,
    first_name TEXT,
    last_name TEXT,
    password TEXT NOT NULL,
    phone TEXT,
    role TEXT,
    bio TEXT,
    avatar TEXT,
    organization TEXT,
    organization_siret TEXT,

    -- Plan & Abonnement
    plan "Plan" DEFAULT 'FREEMIUM' NOT NULL,
    subscription_id TEXT UNIQUE,
    customer_id TEXT,

    -- 2FA
    two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    two_factor_secret TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    last_login_at TIMESTAMP
);

-- ============================================
-- TABLE: sessions
-- ============================================
CREATE TABLE sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    location TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- ============================================
-- TABLE: password_reset_tokens
-- ============================================
CREATE TABLE password_reset_tokens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    used_at TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- ============================================
-- TABLE: verification_tokens
-- ============================================
CREATE TABLE verification_tokens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_verification_tokens_user_id ON verification_tokens(user_id);

-- ============================================
-- TABLE: projects
-- ============================================
CREATE TABLE projects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    description TEXT,
    status "ProjectStatus" DEFAULT 'DRAFT' NOT NULL,
    priority "Priority" DEFAULT 'MEDIUM' NOT NULL,
    confidential BOOLEAN DEFAULT FALSE NOT NULL,
    deadline TIMESTAMP,
    progress INTEGER DEFAULT 0 NOT NULL,

    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);

-- ============================================
-- TABLE: project_members
-- ============================================
CREATE TABLE project_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role "MemberRole" DEFAULT 'VIEWER' NOT NULL,
    invited_by TEXT,

    -- Permissions
    can_edit BOOLEAN DEFAULT FALSE NOT NULL,
    can_invite BOOLEAN DEFAULT FALSE NOT NULL,
    can_delete BOOLEAN DEFAULT FALSE NOT NULL,

    invited_at TIMESTAMP DEFAULT NOW() NOT NULL,
    accepted_at TIMESTAMP,

    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);

-- ============================================
-- TABLE: documents
-- ============================================
CREATE TABLE documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER NOT NULL,
    url TEXT NOT NULL,
    key TEXT NOT NULL,

    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by_id TEXT NOT NULL REFERENCES users(id),

    version INTEGER DEFAULT 1 NOT NULL,
    is_current_version BOOLEAN DEFAULT TRUE NOT NULL,
    confidential BOOLEAN DEFAULT FALSE NOT NULL,

    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_uploaded_by_id ON documents(uploaded_by_id);

-- ============================================
-- TABLE: document_versions
-- ============================================
CREATE TABLE document_versions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    key TEXT NOT NULL,
    size INTEGER NOT NULL,
    uploaded_by_id TEXT NOT NULL,
    changes TEXT,

    created_at TIMESTAMP DEFAULT NOW() NOT NULL,

    UNIQUE(document_id, version)
);

CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);

-- ============================================
-- TABLE: comments
-- ============================================
CREATE TABLE comments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    content TEXT NOT NULL,
    document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id TEXT REFERENCES comments(id),

    page INTEGER,
    position TEXT,

    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_comments_document_id ON comments(document_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- ============================================
-- TABLE: messages
-- ============================================
CREATE TABLE messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    content TEXT NOT NULL,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    read BOOLEAN DEFAULT FALSE NOT NULL,
    read_at TIMESTAMP,
    attachments TEXT,

    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);

-- ============================================
-- TABLE: notifications
-- ============================================
CREATE TABLE notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type "NotificationType" NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,

    read BOOLEAN DEFAULT FALSE NOT NULL,
    read_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- ============================================
-- TABLE: subscriptions
-- ============================================
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_price_id TEXT NOT NULL,
    stripe_customer_id TEXT NOT NULL,

    status "SubscriptionStatus" NOT NULL,
    plan "Plan" NOT NULL,

    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE NOT NULL,
    canceled_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- ============================================
-- TABLE: payments
-- ============================================
CREATE TABLE payments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id),
    stripe_payment_id TEXT UNIQUE NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'eur' NOT NULL,
    status "PaymentStatus" NOT NULL,
    description TEXT,

    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_stripe_payment_id ON payments(stripe_payment_id);

-- ============================================
-- TABLE: invoices
-- ============================================
CREATE TABLE invoices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL REFERENCES users(id),
    stripe_invoice_id TEXT UNIQUE NOT NULL,

    number TEXT UNIQUE NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'eur' NOT NULL,
    status "InvoiceStatus" NOT NULL,

    pdf_url TEXT,
    due_date TIMESTAMP,
    paid_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);

-- ============================================
-- TABLE: audit_logs
-- ============================================
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT NOT NULL,

    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,

    metadata TEXT,
    ip_address TEXT,
    user_agent TEXT,

    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_project_id ON audit_logs(project_id);
CREATE INDEX idx_audit_logs_document_id ON audit_logs(document_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- TRIGGER: Mettre à jour updated_at automatiquement
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer aux tables concernées
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONNÉES DE TEST (optionnel)
-- ============================================

-- Utilisateur de test (mot de passe: "password123")
-- Hash bcrypt pour "password123": $2b$10$rBV2kQI8DXJ7QfW7ZJ6YPOKx4KVFfM9xqJ5bNZqH7XqJZJQJ5J5J5
INSERT INTO users (email, password, name, plan) VALUES
('admin@example.com', '$2b$10$rBV2kQI8DXJ7QfW7ZJ6YPOKx4KVFfM9xqJ5bNZqH7XqJZJQJ5J5J5', 'Admin User', 'STANDARD'),
('user@example.com', '$2b$10$rBV2kQI8DXJ7QfW7ZJ6YPOKx4KVFfM9xqJ5bNZqH7XqJZJQJ5J5J5', 'Test User', 'FREEMIUM');

-- ============================================
-- FIN DU SCRIPT
-- ============================================

SELECT 'Database schema created successfully!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
