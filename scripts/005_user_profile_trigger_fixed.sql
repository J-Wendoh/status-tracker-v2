-- Create function to handle user profile creation
create or replace function handle_new_user()
returns trigger as $$
begin
    -- This will be handled by the application instead of a trigger
    -- to avoid permission issues
    return new;
end;
$$ language plpgsql security definer;

-- Note: User profile creation will be handled in the application code
-- instead of using a database trigger to avoid permission issues
