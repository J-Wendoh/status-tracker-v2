-- Enable Row Level Security and create policies
-- Drop existing policies first to avoid conflicts
drop policy if exists "users_select_own" on users;
drop policy if exists "users_insert_own" on users;
drop policy if exists "users_update_own" on users;
drop policy if exists "activities_select_own" on activities;
drop policy if exists "activities_insert_own" on activities;
drop policy if exists "activities_update_own" on activities;
drop policy if exists "activity_status_select_related" on activity_status;
drop policy if exists "activity_status_insert_hod" on activity_status;
drop policy if exists "activity_status_update_hod" on activity_status;
drop policy if exists "departments_sagas_select_all" on departments_sagas;
drop policy if exists "services_select_all" on services;

-- Enable RLS on all tables
alter table users enable row level security;
alter table activities enable row level security;
alter table activity_status enable row level security;
alter table departments_sagas enable row level security;
alter table services enable row level security;

-- Users policies
create policy "users_select_own" on users
    for select using (auth.uid()::text = id::text);

create policy "users_insert_own" on users
    for insert with check (auth.uid()::text = id::text);

create policy "users_update_own" on users
    for update using (auth.uid()::text = id::text);

-- Activities policies
create policy "activities_select_own" on activities
    for select using (
        auth.uid()::text = officer_id::text or
        exists (
            select 1 from users 
            where users.id::text = auth.uid()::text 
            and (users.role = 'ag' or 
                 (users.role = 'hod_ceo' and users.department_or_saga_id = (
                     select u2.department_or_saga_id from users u2 where u2.id = activities.officer_id
                 )))
        )
    );

create policy "activities_insert_own" on activities
    for insert with check (auth.uid()::text = officer_id::text);

create policy "activities_update_own" on activities
    for update using (auth.uid()::text = officer_id::text);

-- Activity status policies
create policy "activity_status_select_related" on activity_status
    for select using (
        exists (
            select 1 from activities a
            join users u on u.id = a.officer_id
            where a.id = activity_status.activity_id
            and (auth.uid()::text = a.officer_id::text or
                 exists (
                     select 1 from users u2
                     where u2.id::text = auth.uid()::text
                     and (u2.role = 'ag' or 
                          (u2.role = 'hod_ceo' and u2.department_or_saga_id = u.department_or_saga_id))
                 ))
        )
    );

create policy "activity_status_insert_hod" on activity_status
    for insert with check (
        exists (
            select 1 from users
            where users.id::text = auth.uid()::text
            and users.role in ('hod_ceo', 'ag')
        )
    );

create policy "activity_status_update_hod" on activity_status
    for update using (
        exists (
            select 1 from users
            where users.id::text = auth.uid()::text
            and users.role in ('hod_ceo', 'ag')
        )
    );

-- Public read access for departments_sagas and services (needed for registration)
create policy "departments_sagas_select_all" on departments_sagas
    for select using (true);

create policy "services_select_all" on services
    for select using (true);
