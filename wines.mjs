export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO  = process.env.GITHUB_REPO;
  const FILE_PATH    = 'wines.json';
  const API_BASE     = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return {
      statusCode: 500, headers,
      body: JSON.stringify({ error: 'GITHUB_TOKEN vagy GITHUB_REPO környezeti változó nincs beállítva a Netlify dashboardon.' }),
    };
  }

  const ghHeaders = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'GET') {
    try {
      const resp = await fetch(API_BASE, { headers: ghHeaders });
      if (resp.status === 404) return { statusCode: 200, headers, body: JSON.stringify([]) };
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        return { statusCode: resp.status, headers, body: JSON.stringify({ error: `GitHub API hiba: ${err.message || resp.statusText}` }) };
      }
      const data = await resp.json();
      const wines = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
      return { statusCode: 200, headers, body: JSON.stringify(wines) };
    } catch(e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  if (event.httpMethod === 'PUT') {
    try {
      const wines = JSON.parse(event.body);
      const content = Buffer.from(JSON.stringify(wines, null, 2)).toString('base64');

      // Get current SHA (needed for update)
      let sha;
      const getResp = await fetch(API_BASE, { headers: ghHeaders });
      if (getResp.ok) {
        const existing = await getResp.json();
        sha = existing.sha;
      }

      const putResp = await fetch(API_BASE, {
        method: 'PUT',
        headers: ghHeaders,
        body: JSON.stringify({
          message: 'Pincekönyv frissítés',
          content,
          ...(sha ? { sha } : {}),
        }),
      });

      if (!putResp.ok) {
        const err = await putResp.json().catch(() => ({}));
        return { statusCode: putResp.status, headers, body: JSON.stringify({ error: err.message || 'Mentési hiba' }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch(e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
}
