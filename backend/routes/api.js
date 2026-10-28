const express = require('express');
const { supabase, supabaseReady } = require('../supabase');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requireDatabase(_req, res, next) {
  if (!supabaseReady) {
    return res.status(503).json({ error: 'Database is not configured. Set the Supabase values in backend/.env.' });
  }
  return next();
}

function sendDatabaseError(res, error) {
  console.error('Supabase request failed:', error.message);
  return res.status(500).json({ error: 'The database request could not be completed.' });
}

// Return a quiz catalogue without exposing correct answers.
router.get('/quizzes', requireDatabase, async (_req, res) => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, title, category, description, icon, duration_minutes, difficulty, rating')
    .eq('published', true)
    .order('title');

  if (error) return sendDatabaseError(res, error);
  return res.json({ quizzes: data });
});

// Return an individual quiz with questions and options, but never answer keys.
router.get('/quizzes/:id', requireDatabase, async (req, res) => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, title, category, description, icon, duration_minutes, difficulty, rating, questions')
    .eq('id', req.params.id)
    .eq('published', true)
    .maybeSingle();

  if (error) return sendDatabaseError(res, error);
  if (!data) return res.status(404).json({ error: 'Quiz not found.' });

  const safeQuiz = {
    ...data,
    questions: (data.questions || []).map(({ id, text, options }) => ({ id, text, options }))
  };
  return res.json({ quiz: safeQuiz });
});

// Score on the server; the browser is never trusted to submit a score.
router.post('/quizzes/:id/attempts', requireDatabase, async (req, res) => {
  const answers = req.body && req.body.answers;
  if (!Array.isArray(answers) || answers.length < 1 || answers.length > 50) {
    return res.status(400).json({ error: 'answers must be a list containing between 1 and 50 answers.' });
  }

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('id, title, questions')
    .eq('id', req.params.id)
    .eq('published', true)
    .maybeSingle();

  if (quizError) return sendDatabaseError(res, quizError);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
  if (answers.length !== questions.length) {
    return res.status(400).json({ error: `Submit one answer for each of the ${questions.length} questions.` });
  }

  const submitted = new Map();
  for (const answer of answers) {
    if (!answer || typeof answer.questionId !== 'string' || !Number.isInteger(answer.optionIndex)) {
      return res.status(400).json({ error: 'Each answer needs a questionId and an integer optionIndex.' });
    }
    if (submitted.has(answer.questionId)) {
      return res.status(400).json({ error: 'Each question can only be answered once.' });
    }
    submitted.set(answer.questionId, answer.optionIndex);
  }

  let correct = 0;
  for (const question of questions) {
    if (!submitted.has(question.id)) {
      return res.status(400).json({ error: 'An answer is missing for one or more questions.' });
    }
    const optionIndex = submitted.get(question.id);
    if (!Number.isInteger(question.answer_index) || optionIndex < 0 || optionIndex >= question.options.length) {
      return res.status(400).json({ error: 'An answer contains an invalid option.' });
    }
    if (optionIndex === question.answer_index) correct++;
  }

  const score = Math.round((correct / questions.length) * 100);
  const { data: attempt, error: insertError } = await supabase
    .from('quiz_attempts')
    .insert({ quiz_id: quiz.id, score, correct_answers: correct, total_questions: questions.length })
    .select('id, quiz_id, score, correct_answers, total_questions, completed_at')
    .single();

  if (insertError) return sendDatabaseError(res, insertError);
  return res.status(201).json({ attempt: { ...attempt, quiz_title: quiz.title } });
});

// Attempt IDs are UUIDs and act as unguessable links for viewing one result.
router.get('/attempts/:id', requireDatabase, async (req, res) => {
  if (!UUID_PATTERN.test(req.params.id)) return res.status(400).json({ error: 'Attempt ID must be a valid UUID.' });

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('id, quiz_id, score, correct_answers, total_questions, completed_at, quizzes(title)')
    .eq('id', req.params.id)
    .maybeSingle();

  if (error) return sendDatabaseError(res, error);
  if (!data) return res.status(404).json({ error: 'Attempt not found.' });
  return res.json({ attempt: { ...data, quiz_title: data.quizzes.title, quizzes: undefined } });
});

// Only staff with the server-side admin key can view the full attempt report.
router.get('/admin/attempts', requireAdmin, requireDatabase, async (req, res) => {
  const parsedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isInteger(parsedLimit) ? Math.max(1, Math.min(parsedLimit, 100)) : 50;

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('id, quiz_id, score, correct_answers, total_questions, completed_at, quizzes(title)')
    .order('completed_at', { ascending: false })
    .limit(limit);

  if (error) return sendDatabaseError(res, error);
  return res.json({ attempts: data.map(item => ({
    id: item.id,
    quiz_id: item.quiz_id,
    quiz_title: item.quizzes.title,
    score: item.score,
    correct_answers: item.correct_answers,
    total_questions: item.total_questions,
    completed_at: item.completed_at
  })) });
});

module.exports = router;
