# Ground Staff Mock Interview

Angular based mock interview website for aviation ground staff practice.

The app lets a candidate answer random interview questions, record answers through webcam and mic, and review the final score with video previews.

## Features

- Random HR, safety, scenario and operations questions
- Auto flow for every question: the question is shown for 5-10 sec (selectable) and recording starts automatically, then the question is hidden and the candidate gets the answer time (default 45 sec), then the next question comes by itself
- Webcam and microphone recording for every answer (works on phone browsers over HTTPS)
- Review page (no score, practice only) with your notes and video preview of every answer
- Recording download option
- Custom question upload using a simple `.txt` file
- Sample question template download from the website

- Help and support: visitors send a question or bug report, the admin replies and the reply is shown publicly (data kept in Google Sheets via Apps Script)
- Admin panel at `/#admin` (ID and password are checked inside Apps Script, never stored in this repo)
- Privacy disclaimer: interview recordings, answers and notes stay only in the user's browser

## Tech Stack

- Angular 22
- TypeScript
- HTML/CSS
- Browser MediaRecorder API

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Open:

```text
http://localhost:4200/
```

If port `4200` is busy, run:

```bash
npm start -- --port 4201
```

## Build

```bash
npm run build
```

The production build will be created inside:

```text
dist/ground-staff-mock
```

## Custom Question File Format

Download the sample file from the website and edit only the question lines.

Lines starting with `#` are information lines and are ignored by the app.

Format:

```text
department-code | question | important words | marks
```

Example:

```text
customer-service | How will you help a first-time flyer who is confused at check-in? | empathy, documents, guidance, calm | 10
security | What will you do if you see an unattended bag near the gate? | do not touch, report, cordon, procedure | 10
ramp | What will you do if you see foreign object debris near an aircraft stand? | FOD, stop, remove, report, safety | 10
```

Department code (always use this):

```text
general
```

## Support and Admin panel

Follow `SUPPORT_SETUP.md` (Google Sheet + Apps Script from `apps-script/Code.gs`), then set `SUPPORT_API_URL` and `LINKEDIN_URL` in `src/app/support.config.ts`.

## Camera Permission

Webcam recording works on `localhost` or HTTPS only (on a phone use the https:// site link, a plain `http://192.168.x.x` address will not get camera access). The browser will ask for camera and microphone permission when the mock interview starts. If the camera fails, the screen shows the reason with a **Retry camera** button.

## Notes

Recordings are created in the browser for the current session. They can be previewed and downloaded from the result screen.
