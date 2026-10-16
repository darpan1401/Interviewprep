# Support / Help + Admin panel setup (free, Google Sheets)

Visitors send a question or bug report from the website -> it is saved in YOUR Google Sheet.
You open the admin panel, write a reply -> the reply appears publicly on the website under that question.

## 1. Create the Google Sheet + script

1. Open https://sheets.google.com and create a new blank sheet (name it e.g. `Ground Staff Mock Support`).
2. Menu: **Extensions -> Apps Script**.
3. Delete the default code, paste everything from `apps-script/Code.gs`, click **Save**.

## 2. Set your admin ID and password (kept private)

1. In Apps Script left side: **Project Settings** (gear icon).
2. Scroll to **Script Properties -> Add script property**. Add two:

| Property | Value |
| --- | --- |
| `ADMIN_ID` | your admin id |
| `ADMIN_PASSWORD` | a strong password |

3. Click **Save script properties**.

These never go into the website code or GitHub.

## 3. Deploy as Web App

1. Top right: **Deploy -> New deployment -> (gear) Web app**.
2. Execute as: **Me**.
3. Who has access: **Anyone**.
4. Click **Deploy**, allow the permissions (Advanced -> Go to project -> Allow).
5. Copy the **Web app URL** (ends with `/exec`).

> Every time you change `Code.gs` later: **Deploy -> Manage deployments -> Edit (pencil) -> Version: New version -> Deploy**. The URL stays the same.

## 4. Connect the website

Open `src/app/support.config.ts` and set:

```ts
export const SUPPORT_API_URL = 'https://script.google.com/macros/s/XXXXXXXX/exec';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/your-profile';
```

Commit and push. Netlify will redeploy.

## 5. Use it

- Public site: Help section at the bottom (form + answered questions).
- Admin panel: open `https://your-site.netlify.app/#admin`, enter ADMIN_ID and ADMIN_PASSWORD.
  - See all queries (including email, if the visitor gave one), write a reply, delete spam.
  - Only queries that have a reply are shown publicly. Email is never shown publicly.
- You can also see/edit everything directly in the Google Sheet (tab `Queries`).
