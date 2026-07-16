/**
 * Simple shared-password gate for the whole site.
 *
 * Behaviour:
 *  - If the SITE_PASSWORD environment variable is NOT set in Cloudflare,
 *    the site is fully open (this file does nothing).
 *  - If it is set, visitors see a password page once; entering the shared
 *    password sets a cookie that lasts 30 days on that device.
 *
 * To enable: Cloudflare dashboard → klara-website → Settings →
 * Variables and Secrets → add SITE_PASSWORD (type: Secret) → redeploy.
 * To change the password, change the variable and redeploy: all existing
 * cookies stop working automatically.
 */

const COOKIE = 'ee_gate';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

async function sha256Hex(text) {
  const data = new TextEncoder().encode('extended-english-gate:' + text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function gatePage(error = false) {
  return new Response(
    `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Extended English · Members</title>
<style>
  body { margin:0; min-height:100vh; display:grid; place-items:center;
         background:#FBF6EC; color:#2A241B; font-family:Georgia,serif; }
  .card { border:2px solid #2A241B; border-radius:10px; background:#fff;
          box-shadow:5px 5px 0 #2A241B; padding:2.2rem 2.5rem; max-width:24rem;
          margin:1rem; text-align:center; }
  .sun { width:44px; height:44px; border-radius:50%;
         background:radial-gradient(circle at 40% 40%, #F7CE85, #E8A33D 60%, #C97F1B);
         border:2px solid #2A241B; margin:0 auto 1rem; }
  h1 { font-size:1.4rem; margin:0 0 0.4rem; }
  p { color:#5C5346; font-size:0.95rem; line-height:1.5; }
  input { width:100%; box-sizing:border-box; font-size:1rem; padding:0.65rem 0.9rem;
          border:2px solid #2A241B; border-radius:8px; background:#FBF6EC;
          font-family:inherit; margin-top:0.6rem; }
  button { margin-top:1rem; width:100%; font-size:1rem; font-weight:700; cursor:pointer;
           background:#93401D; color:#fff; border:2px solid #2A241B; border-radius:999px;
           padding:0.7rem; box-shadow:3px 3px 0 #2A241B; font-family:inherit; }
  .err { color:#93401D; font-weight:700; font-size:0.9rem; }
</style>
</head>
<body>
  <main class="card">
    <div class="sun" aria-hidden="true"></div>
    <h1>Extended English</h1>
    <p>This study site is for members. Enter the access password you were given.</p>
    ${error ? '<p class="err">That password isn’t right. Try again.</p>' : ''}
    <form method="POST" action="/gate">
      <input type="password" name="password" placeholder="Access password" autofocus required>
      <button type="submit">Enter the site</button>
    </form>
  </main>
</body>
</html>`,
    { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } }
  );
}

export async function onRequest(context) {
  const { request, env, next } = context;

  if (!env.SITE_PASSWORD) return next();

  const expected = await sha256Hex(env.SITE_PASSWORD);
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]{64})`));
  if (match && match[1] === expected) return next();

  const url = new URL(request.url);

  if (request.method === 'POST' && url.pathname === '/gate') {
    let supplied = '';
    try {
      const form = await request.formData();
      supplied = (form.get('password') || '').toString();
    } catch {
      return gatePage(true);
    }
    if (supplied === env.SITE_PASSWORD) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/',
          'Set-Cookie': `${COOKIE}=${expected}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }
    return gatePage(true);
  }

  return gatePage();
}
