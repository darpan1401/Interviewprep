# Ground Staff Mock Interview

Angular based mock interview website for aviation ground staff practice.

The app lets a candidate select a ground operations department, answer random interview questions, record answers through webcam and mic, and review the final score with video previews.

## Features

- Department selection for:
  - Customer Service
  - Security Officer
  - Cabin Appearance
  - Cargo
  - Ramp
  - Catering
- Random HR, safety, scenario and operations questions
- Webcam and microphone recording for every answer
- Final result page with score, answer notes and video preview
- Recording download option
- Custom question upload using a simple `.txt` file
- Sample question template download from the website

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

Valid department codes:

```text
customer-service
security
cabin-appearance
cargo
ramp
catering
```

## Camera Permission

Webcam recording works on `localhost` or HTTPS. The browser will ask for camera and microphone permission when the mock interview starts.

## Notes

Recordings are created in the browser for the current session. They can be previewed and downloaded from the result screen.
