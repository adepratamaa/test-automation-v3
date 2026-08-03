import fs from 'node:fs/promises';
import path from 'node:path';

const resultsPath = process.env.PLAYWRIGHT_JSON_RESULTS || 'test-results/results.json';
const outputPath = process.env.FAILURE_SUMMARY_PATH || 'test-results/failure-summary.md';
const model = process.env.OPENAI_MODEL || 'gpt-5-mini';

async function main() {
  const results = await readJson(resultsPath).catch(async (error) => {
    if (error.code !== 'ENOENT') {
      throw error;
    }

    const summary = [
      '# Failure Summary',
      '',
      `No Playwright JSON report was found at \`${resultsPath}\`.`,
      '',
      'The test job may have failed before Playwright started, or the JSON reporter output path may have changed.',
      '',
    ].join('\n');

    await writeSummary(summary);
    logNotice(`No Playwright JSON report found at ${resultsPath}.`);
    return null;
  });

  if (!results) {
    return;
  }

  const failures = collectFailures(results);

  if (failures.length === 0) {
    const summary = '# Failure Summary\n\nNo failed Playwright tests were found in the latest JSON report.\n';
    await writeSummary(summary);
    logNotice('No failed Playwright tests were found. Skipping OpenAI root-cause analysis.');
    return;
  }

  const fallback = buildFallbackSummary(failures);
  const aiSummary = await getAiSummary(failures).catch((error) => {
    console.warn(`AI summary unavailable: ${error.message}`);
    return null;
  });

  await writeSummary(aiSummary || fallback);
  console.log(`Wrote failure summary for ${failures.length} failed test result(s) to ${outputPath}.`);
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function collectFailures(results) {
  const failures = [];

  for (const suite of results.suites || []) {
    walkSuite(suite, [], failures);
  }

  return failures;
}

function walkSuite(suite, parents, failures) {
  const titlePath = [...parents, suite.title].filter(Boolean);

  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      if (test.status !== 'unexpected') {
        continue;
      }

      const failedResults = (test.results || []).filter((result) => result.status !== 'passed' && result.status !== 'skipped');

      for (const result of failedResults) {
        failures.push({
          title: [...titlePath, spec.title].join(' > '),
          file: spec.file,
          line: spec.line,
          project: test.projectName,
          finalStatus: test.status,
          status: result.status,
          durationMs: result.duration,
          retry: result.retry,
          error: formatError(result.error),
          attachments: (result.attachments || []).map((attachment) => ({
            name: attachment.name,
            contentType: attachment.contentType,
            path: attachment.path,
          })),
        });
      }
    }
  }

  for (const child of suite.suites || []) {
    walkSuite(child, titlePath, failures);
  }
}

function formatError(error) {
  if (!error) {
    return 'No error details were captured.';
  }

  return [error.message, error.stack, error.snippet].filter(Boolean).join('\n\n').slice(0, 6000);
}

function buildFallbackSummary(failures) {
  const sections = failures.map((failure, index) => {
    const likelyCause = inferLikelyCause(failure.error);
    const artifacts = failure.attachments
      .filter((attachment) => attachment.path)
      .map((attachment) => `- ${attachment.name}: \`${attachment.path}\``)
      .join('\n');

    return [
      `## ${index + 1}. ${failure.title}`,
      '',
      `- Status: ${failure.status}`,
      `- Location: \`${failure.file}:${failure.line || 1}\``,
      `- Project: ${failure.project || 'unknown'}`,
      `- Retry: ${failure.retry ?? 0}`,
      `- Likely root cause: ${likelyCause}`,
      '',
      '```',
      failure.error,
      '```',
      artifacts ? `\nArtifacts:\n${artifacts}` : '',
    ].filter(Boolean).join('\n');
  });

  return [
    '# Failure Summary',
    '',
    'OpenAI was not configured or could not be reached, so this summary was generated from Playwright error heuristics.',
    '',
    ...sections,
    '',
  ].join('\n');
}

function inferLikelyCause(error) {
  const text = error.toLowerCase();

  if (text.includes('timeout')) {
    return 'The page, selector, or assertion did not reach the expected state before the timeout.';
  }

  if (text.includes('expected') && text.includes('received')) {
    return 'An assertion mismatch suggests the application state or test data differed from the expected value.';
  }

  if (text.includes('locator') || text.includes('strict mode violation')) {
    return 'A locator likely no longer matches the intended element or matches more than one element.';
  }

  if (text.includes('net::') || text.includes('navigation')) {
    return 'Navigation or network instability may have prevented the page from loading correctly.';
  }

  return 'Review the failing assertion, trace, screenshot, and recent app or test data changes.';
}

async function getAiSummary(failures) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: 'You are a senior QA automation engineer. Summarize failed Playwright tests for a CI job. Be concise, specific, and include likely root causes plus next debugging actions.',
        },
        {
          role: 'user',
          content: `Analyze these Playwright failures and return Markdown:\n\n${JSON.stringify(failures, null, 2)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text = extractResponseText(data);

  if (!text) {
    throw new Error('OpenAI response did not include text output.');
  }

  return text.endsWith('\n') ? text : `${text}\n`;
}

function extractResponseText(data) {
  if (typeof data.output_text === 'string') {
    return data.output_text;
  }

  return (data.output || [])
    .flatMap((item) => item.content || [])
    .filter((content) => content.type === 'output_text' && content.text)
    .map((content) => content.text)
    .join('\n');
}

function logNotice(message) {
  if (process.env.GITHUB_ACTIONS) {
    console.log(`::notice::${message}`);
    return;
  }

  console.log(message);
}

async function writeSummary(summary) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, summary);

  if (process.env.GITHUB_STEP_SUMMARY) {
    await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
