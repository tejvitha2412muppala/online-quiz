-- Quizly demo schema for Supabase PostgreSQL.
-- Quiz answers are stored server-side and excluded from public API responses.

create table if not exists public.quizzes (
  id text primary key,
  title text not null,
  category text not null,
  description text not null,
  icon text not null default '✦',
  duration_minutes integer not null check (duration_minutes between 1 and 180),
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Advanced')),
  rating numeric(2, 1) not null default 4.5 check (rating between 0 and 5),
  published boolean not null default true,
  questions jsonb not null,
  created_at timestamptz not null default now(),
  constraint quiz_questions_are_array check (jsonb_typeof(questions) = 'array' and jsonb_array_length(questions) > 0)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id text not null references public.quizzes(id) on update cascade on delete restrict,
  score integer not null check (score between 0 and 100),
  correct_answers integer not null check (correct_answers >= 0),
  total_questions integer not null check (total_questions > 0),
  completed_at timestamptz not null default now(),
  constraint attempt_answer_count_valid check (correct_answers <= total_questions),
  constraint attempt_score_matches_answers check (
    score = round((correct_answers::numeric / total_questions) * 100)::integer
  )
);

create index if not exists quiz_attempts_completed_at_idx
  on public.quiz_attempts (completed_at desc);
create index if not exists quiz_attempts_quiz_id_idx
  on public.quiz_attempts (quiz_id);

-- Browser clients receive no direct table permissions. The Express server accesses
-- Supabase with its service-role key and performs authorization in backend routes.
alter table public.quizzes enable row level security;
alter table public.quiz_attempts enable row level security;
revoke all on public.quizzes from anon, authenticated;
revoke all on public.quiz_attempts from anon, authenticated;

-- Sample records use the IDs already present in the Quizly frontend.
insert into public.quizzes
  (id, title, category, description, icon, duration_minutes, difficulty, rating, questions)
values
  ('critical', 'Critical Thinking', 'Thinking', 'Sharpen your reasoning with fun logic puzzles.', '◈', 10, 'Medium', 5.0,
   '[
     {"id":"critical-1","text":"All roses are flowers. Some flowers fade quickly. Which statement must be true?","options":["All roses fade quickly","Some roses fade quickly","Roses are flowers","No roses fade quickly"],"answer_index":2},
     {"id":"critical-2","text":"What comes next in the sequence: 2, 4, 8, 16, ...?","options":["20","24","30","32"],"answer_index":3},
     {"id":"critical-3","text":"If today is Wednesday, what day will it be 10 days from now?","options":["Friday","Saturday","Sunday","Monday"],"answer_index":1},
     {"id":"critical-4","text":"A book and a pen cost $11 total. The book costs $10 more than the pen. How much is the pen?","options":["$0.50","$1.00","$1.50","$2.00"],"answer_index":0},
     {"id":"critical-5","text":"Which word does not belong: triangle, square, circle, cube?","options":["Triangle","Square","Circle","Cube"],"answer_index":3}
   ]'::jsonb),
  ('web', 'Web Dev: The Basics', 'Technology', 'HTML, CSS, and the building blocks of the web.', '⌘', 8, 'Medium', 4.9,
   '[
     {"id":"web-1","text":"What does HTML stand for?","options":["Hyper Trainer Marking Language","HyperText Markup Language","High Text Machine Language","Hyperlink and Text Management Language"],"answer_index":1},
     {"id":"web-2","text":"Which CSS property changes text color?","options":["font-style","background","color","text-decoration"],"answer_index":2},
     {"id":"web-3","text":"Which HTML tag is used for the largest heading?","options":["<head>","<h6>","<heading>","<h1>"],"answer_index":3},
     {"id":"web-4","text":"What does CSS primarily describe?","options":["The structure of a webpage","The appearance of a webpage","A database query","A web address"],"answer_index":1},
     {"id":"web-5","text":"Which language adds interactivity to a web page?","options":["JavaScript","SQL","XML","Bash"],"answer_index":0}
   ]'::jsonb)
on conflict (id) do nothing;
