export const WELCOME_EMAIL_HTML = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Welcome to BarMagazine</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #F5F0E8; font-family: 'Inter', Arial, sans-serif; color: #1A1A1A; -webkit-font-smoothing: antialiased; }
    .email-wrapper { background-color: #F5F0E8; padding: 40px 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; }
    .email-header { background-color: #1A1A1A; padding: 32px 48px; text-align: center; }
    .email-header img { height: 28px; width: auto; display: inline-block; }
    .email-hero { background-color: #1A1A1A; padding: 0 48px 48px; text-align: center; border-bottom: 3px solid #7B1E1E; }
    .email-hero h1 { font-family: 'Inter', Arial, sans-serif; font-size: 36px; font-weight: 700; color: #F5F0E8; line-height: 1.2; margin-bottom: 16px; letter-spacing: -0.5px; }
    .email-hero p { font-family: 'Inter', Arial, sans-serif; font-size: 16px; color: #A89880; line-height: 1.6; max-width: 420px; margin: 0 auto; }
    .email-body { padding: 48px; background-color: #FFFFFF; }
    .email-body p { font-family: 'Inter', Arial, sans-serif; font-size: 16px; color: #333333; line-height: 1.7; margin-bottom: 20px; }
    .expect-section { background-color: #F5F0E8; border-left: 3px solid #7B1E1E; padding: 24px 28px; margin: 32px 0; }
    .expect-section h2 { font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #1A1A1A; margin-bottom: 16px; letter-spacing: 1px; text-transform: uppercase; }
    .expect-item { display: flex; align-items: flex-start; margin-bottom: 12px; }
    .expect-item:last-child { margin-bottom: 0; }
    .expect-dot { width: 6px; height: 6px; background-color: #7B1E1E; border-radius: 50%; margin-top: 8px; margin-right: 12px; flex-shrink: 0; }
    .expect-item p { font-size: 15px; color: #444444; line-height: 1.5; margin-bottom: 0; }
    .cta-wrapper { text-align: center; margin: 36px 0; }
    .cta-button { display: inline-block; background-color: #7B1E1E; color: #FFFFFF !important; font-family: 'Inter', Arial, sans-serif; font-size: 15px; font-weight: 600; letter-spacing: 0; text-decoration: none; padding: 14px 36px; }
    .divider { border: none; border-top: 1px solid #E8E0D4; margin: 32px 0; }
    .email-footer { background-color: #1A1A1A; padding: 32px 48px; text-align: center; }
    .email-footer p { font-family: 'Inter', Arial, sans-serif; font-size: 13px; color: #666666; line-height: 1.6; margin-bottom: 8px; }
    .email-footer a { color: #A89880; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .email-header { padding: 24px 24px; }
      .email-hero { padding: 0 24px 36px; }
      .email-hero h1 { font-size: 28px; }
      .email-body { padding: 32px 24px; }
      .email-footer { padding: 24px 24px; }
      .expect-section { padding: 20px 20px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <img src="https://barmagazine.com/logo-white.png" alt="BarMagazine" width="164" height="29" />
      </div>
      <div class="email-hero">
        <h1>Welcome to<br>BarMagazine</h1>
        <p>The essential read for bar professionals, bartenders, and cocktail culture enthusiasts worldwide.</p>
      </div>
      <div class="email-body">
        <p>Thank you for subscribing. You're now part of a community of bar owners, bartenders, and industry professionals who rely on BarMagazine for the stories that matter.</p>
        <div class="expect-section">
          <h2>What to expect</h2>
          <div class="expect-item">
            <div class="expect-dot"></div>
            <p><strong>Bar profiles &amp; spotlights</strong> — In-depth features on the world's most influential bars</p>
          </div>
          <div class="expect-item">
            <div class="expect-dot"></div>
            <p><strong>Industry news &amp; awards</strong> — Coverage of competitions, openings, and the people shaping the industry</p>
          </div>
          <div class="expect-item">
            <div class="expect-dot"></div>
            <p><strong>Cocktail culture</strong> — Trends, techniques, and the stories behind the drinks</p>
          </div>
          <div class="expect-item">
            <div class="expect-dot"></div>
            <p><strong>Bar directory</strong> — Discover and explore exceptional bars around the world</p>
          </div>
        </div>
        <p>In the meantime, explore the latest from the bar world on our website.</p>
        <div class="cta-wrapper">
          <a href="https://barmagazine.com" class="cta-button">Read BarMagazine</a>
        </div>
        <hr class="divider" />
        <p style="font-size: 14px; color: #888888; text-align: center; margin-bottom: 0;">
          Is your bar listed in our directory?<br>
          <a href="https://barmagazine.com/add-your-bar" style="color: #7B1E1E; text-decoration: none; font-weight: 600;">Add your bar for free &rarr;</a>
        </p>
      </div>
      <div class="email-footer">
        <p>You're receiving this because you subscribed at BarMagazine.com</p>
        <p style="margin-top: 12px; font-size: 12px; color: #444444;">BarMagazine &middot; barmagazine.com</p>
      </div>
    </div>
  </div>
</body>
</html>`;
