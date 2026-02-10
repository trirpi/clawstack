export type PostCategory = 'ARTICLE' | 'SCRIPT' | 'PLUGIN' | 'PROMPT' | 'TUTORIAL' | 'CONFIG'
export type PostVisibility = 'FREE' | 'PREVIEW' | 'PAID'

export interface PostTemplate {
  key: string
  category: PostCategory
  title: string
  excerpt: string
  publicationName: string
  visibility: PostVisibility
  content: string
}

export const POST_TEMPLATES: PostTemplate[] = [
  {
    key: 'weekly-pipeline-health-check',
    category: 'SCRIPT',
    title: 'Weekly Pipeline Health Check (Boilerplate)',
    excerpt:
      'A ready-to-publish issue template for checking failed automations, flaky tests, and on-call notes.',
    publicationName: 'Clawstack Editorial',
    visibility: 'FREE',
    content: `
<h1>Weekly Pipeline Health Check</h1>
<p>Use this weekly report to summarize CI reliability and release blockers.</p>
<h2>1. Summary</h2>
<ul>
  <li>Total workflow runs this week:</li>
  <li>Failure rate:</li>
  <li>Primary failing job:</li>
</ul>
<h2>2. Flaky Tests</h2>
<ul>
  <li>Test name:</li>
  <li>Failure pattern:</li>
  <li>Mitigation planned:</li>
</ul>
<h2>3. Action Items</h2>
<ul>
  <li>[ ] Owner - fix pipeline caching issue</li>
  <li>[ ] Owner - stabilize visual regression snapshot</li>
  <li>[ ] Owner - update runbook</li>
</ul>
`,
  },
  {
    key: 'prompt-versioning-workflow',
    category: 'TUTORIAL',
    title: 'Prompt Versioning Workflow (Boilerplate)',
    excerpt:
      'A practical structure for publishing prompt changelogs with rollout notes and fallback guidance.',
    publicationName: 'Clawstack Editorial',
    visibility: 'FREE',
    content: `
<h1>Prompt Versioning Workflow</h1>
<p>Document prompt changes with rollout and fallback steps.</p>
<h2>Change Log</h2>
<ul>
  <li><strong>Version:</strong> vX.Y.Z</li>
  <li><strong>Goal:</strong> Improve output consistency for ...</li>
  <li><strong>Key change:</strong> Added constraints for ...</li>
</ul>
<h2>Rollout Plan</h2>
<ol>
  <li>Deploy to 10% of traffic</li>
  <li>Track output quality and latency for 24h</li>
  <li>Promote to 100% if thresholds pass</li>
</ol>
<h2>Fallback</h2>
<p>Rollback trigger: quality score &lt; baseline for more than 30 minutes.</p>
`,
  },
  {
    key: 'incident-digest-generator',
    category: 'PLUGIN',
    title: 'Incident Digest Generator (Boilerplate)',
    excerpt:
      'A starter template for a daily incident digest post with severity tags and remediation checklist.',
    publicationName: 'Clawstack Editorial',
    visibility: 'PREVIEW',
    content: `
<h1>Daily Incident Digest</h1>
<p>Summarize incidents from the last 24 hours.</p>
<h2>Incidents</h2>
<ul>
  <li><strong>SEV-1</strong> Service outage impacting ...</li>
  <li><strong>SEV-2</strong> Elevated latency on ...</li>
  <li><strong>SEV-3</strong> Third-party timeout spikes</li>
</ul>
<h2>Root Cause Themes</h2>
<p>Infrastructure, deployment sequencing, and external dependency instability.</p>
<h2>Remediation Checklist</h2>
<ul>
  <li>[ ] Add alert threshold for early saturation signal</li>
  <li>[ ] Update deploy guardrails</li>
  <li>[ ] Publish post-incident review link</li>
</ul>
`,
  },
]

export function getPostTemplate(templateKey?: string | null): PostTemplate | null {
  if (!templateKey) {
    return null
  }

  return POST_TEMPLATES.find((template) => template.key === templateKey) ?? null
}
