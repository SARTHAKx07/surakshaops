-- Create a profile automatically for each newly registered Auth user.
-- The role is deliberately fixed to employee; sign-up metadata cannot grant admin privileges.
create or replace function public.handle_new_surakshaops_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    'employee'::public.app_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_surakshaops_auth_user_created on auth.users;
create trigger on_surakshaops_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_surakshaops_user();
