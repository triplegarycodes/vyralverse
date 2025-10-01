export const vyralSupabaseSchema = `
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  grade_level text,
  created_at timestamptz default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  instructor text,
  school_year text,
  period text,
  created_at timestamptz default now()
);

create table if not exists public.schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.students(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  start_time timestamptz,
  end_time timestamptz,
  completion_rate numeric default 0.7,
  accuracy numeric default 0.7,
  next_assessment text,
  created_at timestamptz default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.students(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  title text,
  description text,
  due_date date,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.learning_preferences (
  user_id uuid primary key references public.students(id) on delete cascade,
  learning_style text default 'visual',
  collaborators text[] default '{}',
  challenge_bias text default 'balanced',
  updated_at timestamptz default now()
);

create table if not exists public.quest_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.students(id) on delete cascade,
  quest_id text,
  status text,
  xp_earned integer,
  updated_at timestamptz default now()
);

create view if not exists public.quest_progress_view as
  select user_id, quest_id, status, xp_earned, updated_at
  from public.quest_progress;

create view if not exists public.skill_performance_view as
  select user_id,
         coalesce(avg(completion_rate), 0.7) as completion_rate,
         coalesce(avg(accuracy), 0.7) as accuracy
  from public.schedule_blocks
  group by user_id;

create table if not exists public.collaboration_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.students(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  peer_name text,
  project text,
  status text,
  created_at timestamptz default now()
);

create table if not exists public.daily_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.students(id) on delete cascade,
  date date,
  label text,
  value text,
  delta text
);

create table if not exists public.skill_progressions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.students(id) on delete cascade,
  skill_name text,
  baseline text,
  target text,
  validation_status text,
  grade_delta numeric,
  date date default now()
);

create table if not exists public.tomorrow_plan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.students(id) on delete cascade,
  date date,
  block text,
  focus text,
  quest_id text,
  college_readiness_signal text
);

create table if not exists public.wellness_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.students(id) on delete cascade,
  date date,
  stress_level numeric,
  mood text,
  recommendation text
);

create table if not exists public.support_resources (
  id text primary key,
  threshold numeric,
  notes text
);

create table if not exists public.counseling_interventions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.students(id) on delete cascade,
  priority text,
  scheduled_at timestamptz,
  resource_id text references public.support_resources(id),
  notes text,
  created_at timestamptz default now()
);

create or replace function public.resolve_course_from_context(
  p_user_id uuid,
  p_schedule_block text,
  p_beacon text,
  p_gps_code text
) returns table(course_id uuid, course_name text, instructor text, confidence numeric) as $$
  select c.id,
         c.name,
         c.instructor,
         0.6 + coalesce(random() / 5, 0)
  from public.courses c
  join public.schedule_blocks sb on sb.course_id = c.id
  where sb.user_id = p_user_id
  order by sb.start_time desc
  limit 1;
$$ language sql;

create or replace function public.compute_student_risk(p_user_id uuid)
returns table(academic_risk numeric, stress_risk numeric, absenteeism_risk numeric) as $$
  select
    least(1, greatest(0, 0.4 + coalesce(avg(0.7 - sb.completion_rate), 0))) as academic_risk,
    least(1, greatest(0, 0.3 + coalesce(avg(wl.stress_level) / 10, 0))) as stress_risk,
    least(1, greatest(0, 0.2 + coalesce(count(*) filter (where wl.stress_level > 7) / 20.0, 0))) as absenteeism_risk
  from public.schedule_blocks sb
  left join public.wellness_logs wl on wl.user_id = p_user_id
  where sb.user_id = p_user_id;
$$ language sql;
`;
