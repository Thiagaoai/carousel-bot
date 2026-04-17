// Usage: node test-supabase.js
// Tests connectivity to the agente_dev schema using .env credentials.

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { db: { schema: 'agente_dev' } }
);

const logProjects = (projects) => {
  console.log(`\nProjetos (${projects.length} companies):`);
  projects.forEach((project) => {
    console.log(`  ${project.slug} - ${project.client_name} [${project.status}]`);
  });
};

(async () => {
  console.log('Testing Supabase connection...');
  console.log(`URL: ${process.env.SUPABASE_URL}`);

  let hasError = false;

  const { data: projects, error: projectsError } = await supabase
    .from('projetos')
    .select('slug, client_name, status')
    .order('slug');

  if (projectsError) {
    console.error('projetos query failed:', projectsError.message);
    hasError = true;
  } else {
    logProjects(projects);
  }

  const { data: videos, error: videosError } = await supabase
    .from('videos')
    .select('*')
    .limit(1);

  if (videosError) {
    console.error('videos query failed:', videosError.message);
    hasError = true;
  } else {
    const message =
      videos.length === 0 ? 'OK (empty - ready for production)' : `${videos.length} records`;
    console.log(`\nVideos table: ${message}`);
  }

  const { data: budgetLog, error: budgetError } = await supabase
    .from('budget_log')
    .select('*')
    .limit(1);

  if (budgetError) {
    console.error('budget_log query failed:', budgetError.message);
    hasError = true;
  } else {
    const message =
      budgetLog.length === 0 ? 'OK (empty - no spending yet)' : `${budgetLog.length} records`;
    console.log(`Budget log: ${message}`);
  }

  console.log('\nConnection test complete.');

  if (hasError) {
    process.exitCode = 1;
  }
})().catch((error) => {
  console.error('Supabase smoke test failed:', error.message);
  process.exit(1);
});
