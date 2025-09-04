-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Reordered table creation to fix dependency issues
-- Departments and SAGAs (must be created first)
create table departments_sagas (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    type text check (type in ('department','saga')) not null
);

-- Services linked to Departments/SAGAs
create table services (
    id uuid primary key default uuid_generate_v4(),
    department_or_saga_id uuid references departments_sagas(id) on delete cascade,
    name text not null
);

-- Users table (references departments_sagas)
create table users (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    id_number text not null unique,
    county text not null,
    role text check (role in ('officer','hod_ceo','ag')) not null default 'officer',
    category text check (category in ('department','saga')) not null,
    department_or_saga_id uuid references departments_sagas(id),
    created_at timestamp default now()
);

-- Officer Activities
create table activities (
    id uuid primary key default uuid_generate_v4(),
    officer_id uuid references users(id) on delete cascade,
    service_id uuid references services(id) on delete cascade,
    description text,
    count integer not null,
    file_url text,
    created_at timestamp default now()
);

-- HOD/CEO Status Updates
create table activity_status (
    id uuid primary key default uuid_generate_v4(),
    activity_id uuid references activities(id) on delete cascade,
    pending_count integer default 0,
    completed_count integer default 0,
    updated_by uuid references users(id),
    updated_at timestamp default now()
);
