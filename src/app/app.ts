import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Stage = 'setup' | 'interview' | 'results';

type DepartmentId = 'customer-service' | 'security' | 'cabin-appearance' | 'cargo' | 'ramp' | 'catering';

interface Department {
  id: DepartmentId;
  name: string;
  area: string;
  icon: string;
  color: string;
}

interface Question {
  department: DepartmentId;
  prompt: string;
  type: 'HR' | 'Scenario' | 'Safety' | 'Operations';
  keywords: string[];
  maxScore: number;
}

interface AnswerRecord {
  question: Question;
  rating: number;
  notes: string;
  videoUrl?: string;
  durationSeconds: number;
}

const DEPARTMENTS: Department[] = [
  {
    id: 'customer-service',
    name: 'Customer Service',
    area: 'Check-in, boarding gate, baggage desk',
    icon: 'CS',
    color: '#12665a',
  },
  {
    id: 'security',
    name: 'Security Officer',
    area: 'Access control, screening support, threat awareness',
    icon: 'SO',
    color: '#8f3d25',
  },
  {
    id: 'cabin-appearance',
    name: 'Cabin Appearance',
    area: 'Aircraft cleaning, lost item checks, presentation',
    icon: 'CA',
    color: '#5444a0',
  },
  {
    id: 'cargo',
    name: 'Cargo',
    area: 'Documents, warehouse, dangerous goods awareness',
    icon: 'CG',
    color: '#2f5f9f',
  },
  {
    id: 'ramp',
    name: 'Ramp',
    area: 'Apron safety, baggage loading, turnaround',
    icon: 'RA',
    color: '#6f5a18',
  },
  {
    id: 'catering',
    name: 'Catering',
    area: 'Flight kitchen, meal uplift, hygiene and seals',
    icon: 'CT',
    color: '#7a3455',
  },
];

const BANK: Question[] = [
  {
    department: 'customer-service',
    prompt: 'A passenger is angry because the flight is delayed and they may miss a connection. How will you handle the conversation?',
    type: 'Scenario',
    keywords: ['empathy', 'facts', 'options', 'supervisor', 'calm'],
    maxScore: 10,
  },
  {
    department: 'customer-service',
    prompt: 'Tell us about yourself and why you want to work in airport ground operations.',
    type: 'HR',
    keywords: ['service', 'aviation', 'teamwork', 'shift', 'responsibility'],
    maxScore: 10,
  },
  {
    department: 'customer-service',
    prompt: 'How would you explain excess baggage charges to a passenger who refuses to pay?',
    type: 'Scenario',
    keywords: ['policy', 'polite', 'alternatives', 'documentation', 'escalation'],
    maxScore: 10,
  },
  {
    department: 'customer-service',
    prompt: 'What details will you verify before issuing a boarding pass?',
    type: 'Operations',
    keywords: ['identity', 'ticket', 'destination', 'documents', 'baggage'],
    maxScore: 10,
  },
  {
    department: 'customer-service',
    prompt: 'How do you manage a long queue when boarding is about to close?',
    type: 'Scenario',
    keywords: ['priority', 'communication', 'queue', 'coordination', 'calm'],
    maxScore: 10,
  },
  {
    department: 'security',
    prompt: 'You notice an unattended bag near a gate. What are your immediate actions?',
    type: 'Safety',
    keywords: ['do not touch', 'cordon', 'report', 'supervisor', 'procedure'],
    maxScore: 10,
  },
  {
    department: 'security',
    prompt: 'How would you respond if a colleague asks you to ignore an access-control step because everyone is in a hurry?',
    type: 'Scenario',
    keywords: ['no shortcut', 'policy', 'safety', 'respectful', 'report'],
    maxScore: 10,
  },
  {
    department: 'security',
    prompt: 'What does aviation security mean to you in a ground-staff role?',
    type: 'HR',
    keywords: ['passengers', 'aircraft', 'vigilance', 'rules', 'responsibility'],
    maxScore: 10,
  },
  {
    department: 'security',
    prompt: 'A passenger becomes verbally aggressive during screening support. How will you de-escalate?',
    type: 'Scenario',
    keywords: ['calm voice', 'distance', 'policy', 'help', 'incident'],
    maxScore: 10,
  },
  {
    department: 'security',
    prompt: 'Which habits help you stay alert during night shifts?',
    type: 'HR',
    keywords: ['rest', 'hydration', 'rotation', 'checklist', 'focus'],
    maxScore: 10,
  },
  {
    department: 'cabin-appearance',
    prompt: 'What would you check before declaring the cabin ready for boarding?',
    type: 'Operations',
    keywords: ['seat pockets', 'lavatory', 'overhead bins', 'lost items', 'cleanliness'],
    maxScore: 10,
  },
  {
    department: 'cabin-appearance',
    prompt: 'You find a passenger passport during cabin cleaning. What will you do?',
    type: 'Safety',
    keywords: ['secure', 'report', 'handover', 'log', 'chain of custody'],
    maxScore: 10,
  },
  {
    department: 'cabin-appearance',
    prompt: 'How will you work quickly without missing safety or cleanliness standards?',
    type: 'Scenario',
    keywords: ['checklist', 'zones', 'teamwork', 'quality', 'time'],
    maxScore: 10,
  },
  {
    department: 'cabin-appearance',
    prompt: 'Why is cabin appearance important for an airline brand?',
    type: 'HR',
    keywords: ['first impression', 'comfort', 'trust', 'hygiene', 'brand'],
    maxScore: 10,
  },
  {
    department: 'cargo',
    prompt: 'What information would you check on cargo documents before acceptance?',
    type: 'Operations',
    keywords: ['shipper', 'weight', 'destination', 'contents', 'special handling'],
    maxScore: 10,
  },
  {
    department: 'cargo',
    prompt: 'How would you react if a package looks damaged or leaking?',
    type: 'Safety',
    keywords: ['isolate', 'do not load', 'report', 'dangerous goods', 'documentation'],
    maxScore: 10,
  },
  {
    department: 'cargo',
    prompt: 'How do you avoid errors when handling multiple shipments under time pressure?',
    type: 'Scenario',
    keywords: ['scan', 'labels', 'double-check', 'sequence', 'communication'],
    maxScore: 10,
  },
  {
    department: 'cargo',
    prompt: 'What is your understanding of dangerous goods awareness?',
    type: 'Operations',
    keywords: ['classification', 'labels', 'training', 'segregation', 'reporting'],
    maxScore: 10,
  },
  {
    department: 'ramp',
    prompt: 'What safety rules will you follow while working around an aircraft on the apron?',
    type: 'Safety',
    keywords: ['PPE', 'engines', 'vehicles', 'FOD', 'signals'],
    maxScore: 10,
  },
  {
    department: 'ramp',
    prompt: 'A turnaround is running late. How do you keep speed without compromising safety?',
    type: 'Scenario',
    keywords: ['coordination', 'checklist', 'no shortcut', 'roles', 'supervisor'],
    maxScore: 10,
  },
  {
    department: 'ramp',
    prompt: 'What is FOD and why is it serious on the ramp?',
    type: 'Operations',
    keywords: ['foreign object debris', 'engine damage', 'inspection', 'report', 'prevention'],
    maxScore: 10,
  },
  {
    department: 'ramp',
    prompt: 'How would you handle a disagreement with a teammate during loading?',
    type: 'Scenario',
    keywords: ['pause safely', 'communicate', 'load plan', 'supervisor', 'respect'],
    maxScore: 10,
  },
  {
    department: 'catering',
    prompt: 'What hygiene steps are important before loading meals onto an aircraft?',
    type: 'Operations',
    keywords: ['temperature', 'seal', 'PPE', 'expiry', 'clean equipment'],
    maxScore: 10,
  },
  {
    department: 'catering',
    prompt: 'A meal count does not match the flight load sheet. What will you do?',
    type: 'Scenario',
    keywords: ['verify', 'report', 'do not guess', 'documentation', 'coordination'],
    maxScore: 10,
  },
  {
    department: 'catering',
    prompt: 'How would you prevent cross-contamination in a flight kitchen or loading area?',
    type: 'Safety',
    keywords: ['segregation', 'allergens', 'cleaning', 'temperature', 'labels'],
    maxScore: 10,
  },
  {
    department: 'catering',
    prompt: 'Why are seals and handover records important in catering operations?',
    type: 'Operations',
    keywords: ['security', 'traceability', 'tamper evidence', 'audit', 'accountability'],
    maxScore: 10,
  },
];

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  @ViewChild('cameraPreview') cameraPreview?: ElementRef<HTMLVideoElement>;

  readonly departments = DEPARTMENTS;
  readonly selectedDepartment = signal<DepartmentId>('customer-service');
  readonly stage = signal<Stage>('setup');
  readonly candidateName = signal('');
  readonly examSize = signal(6);
  readonly questionSeconds = signal(90);
  readonly customQuestions = signal<Question[]>([]);
  readonly interviewQuestions = signal<Question[]>([]);
  readonly answers = signal<AnswerRecord[]>([]);
  readonly currentIndex = signal(0);
  readonly currentRating = signal(3);
  readonly currentNotes = signal('');
  readonly cameraReady = signal(false);
  readonly isRecording = signal(false);
  readonly recordingSeconds = signal(0);
  readonly uploadMessage = signal('No custom file added');
  readonly previewIndex = signal(0);

  private stream?: MediaStream;
  private recorder?: MediaRecorder;
  private chunks: Blob[] = [];
  private recordingTimer?: number;
  private activeStartedAt = 0;

  readonly activeDepartment = computed(
    () => this.departments.find((department) => department.id === this.selectedDepartment()) ?? this.departments[0],
  );

  readonly availableCount = computed(
    () => this.allQuestions().filter((question) => question.department === this.selectedDepartment()).length,
  );

  readonly currentQuestion = computed(() => this.interviewQuestions()[this.currentIndex()]);
  readonly progress = computed(() => {
    const total = this.interviewQuestions().length || 1;
    return Math.round(((this.currentIndex() + 1) / total) * 100);
  });

  readonly finalScore = computed(() => {
    const total = this.answers().reduce((sum, answer) => sum + answer.question.maxScore, 0);
    const earned = this.answers().reduce((sum, answer) => sum + answer.rating * 2, 0);
    return total ? Math.round((earned / total) * 100) : 0;
  });

  readonly resultBand = computed(() => {
    const score = this.finalScore();
    if (score >= 80) return 'Interview Ready';
    if (score >= 60) return 'Good Practice Round';
    return 'Needs More Rehearsal';
  });

  readonly previewAnswer = computed(() => this.answers()[this.previewIndex()]);

  allQuestions(): Question[] {
    return [...BANK, ...this.customQuestions()];
  }

  selectDepartment(id: DepartmentId): void {
    this.selectedDepartment.set(id);
  }

  setExamSize(value: string): void {
    this.examSize.set(Number(value));
  }

  async startInterview(): Promise<void> {
    const pool = this.shuffle(this.allQuestions().filter((question) => question.department === this.selectedDepartment()));
    this.interviewQuestions.set(pool.slice(0, Math.min(this.examSize(), pool.length)));
    this.answers.set([]);
    this.previewIndex.set(0);
    this.currentIndex.set(0);
    this.currentRating.set(3);
    this.currentNotes.set('');
    this.stage.set('interview');
    await this.enableCamera();
  }

  async enableCamera(): Promise<void> {
    if (this.stream) {
      this.attachStream();
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { width: 1280, height: 720 } });
      this.cameraReady.set(true);
      this.attachStream();
    } catch {
      this.cameraReady.set(false);
    }
  }

  startRecording(): void {
    if (!this.stream || this.isRecording()) return;
    this.chunks = [];
    this.recorder = new MediaRecorder(this.stream);
    this.recorder.ondataavailable = (event) => {
      if (event.data.size) this.chunks.push(event.data);
    };
    this.activeStartedAt = Date.now();
    this.recordingSeconds.set(0);
    this.recordingTimer = window.setInterval(() => {
      this.recordingSeconds.set(Math.floor((Date.now() - this.activeStartedAt) / 1000));
    }, 1000);
    this.recorder.start();
    this.isRecording.set(true);
  }

  stopRecording(): void {
    if (!this.recorder || !this.isRecording()) return;
    this.recorder.stop();
    this.isRecording.set(false);
    window.clearInterval(this.recordingTimer);
  }

  async saveAndNext(): Promise<void> {
    const question = this.currentQuestion();
    if (!question) return;

    const videoUrl = await this.stopAndBuildVideoUrl();
    const record: AnswerRecord = {
      question,
      rating: this.currentRating(),
      notes: this.currentNotes(),
      videoUrl,
      durationSeconds: this.recordingSeconds(),
    };

    this.answers.update((answers) => [...answers, record]);
    this.currentRating.set(3);
    this.currentNotes.set('');
    this.recordingSeconds.set(0);

    if (this.currentIndex() + 1 >= this.interviewQuestions().length) {
      this.previewIndex.set(0);
      this.stage.set('results');
      this.stopCamera();
      return;
    }

    this.currentIndex.update((index) => index + 1);
    setTimeout(() => this.attachStream());
  }

  restart(): void {
    this.answers().forEach((answer) => {
      if (answer.videoUrl) URL.revokeObjectURL(answer.videoUrl);
    });
    this.stage.set('setup');
    this.answers.set([]);
    this.interviewQuestions.set([]);
    this.previewIndex.set(0);
    this.currentIndex.set(0);
    this.stopCamera();
  }

  selectPreview(index: number): void {
    this.previewIndex.set(index);
  }

  downloadSample(): void {
    const sample = [
      '# INFO - DO NOT EDIT THESE LINES',
      '# Lines starting with # are ignored by the website.',
      '# Write only one question per line below.',
      '# Easy format:',
      '# department-code | question | important words | marks',
      '#',
      '# Department codes:',
      '# customer-service',
      '# security',
      '# cabin-appearance',
      '# cargo',
      '# ramp',
      '# catering',
      '#',
      '# EXAMPLE - You can copy this style:',
      '# customer-service | How will you help a passenger whose baggage is overweight? | polite, policy, options, supervisor | 10',
      '',
      '# EDITABLE QUESTIONS START BELOW',
      'customer-service | How will you help a first-time flyer who is confused at check-in? | empathy, documents, guidance, calm | 10',
      'security | What will you do if you see an unattended bag near the gate? | do not touch, report, cordon, procedure | 10',
      'ramp | What will you do if you see foreign object debris near an aircraft stand? | FOD, stop, remove, report, safety | 10',
      'catering | How will you verify special meals before handover? | meal code, passenger count, label, seal, record | 10',
    ].join('\n');
    this.downloadText('ground-staff-question-template.txt', sample);
  }

  async importQuestions(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsed = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => line.split('|').map((part) => part.trim()))
      .filter((parts) => parts.length >= 3)
      .map((parts): Question | undefined => {
        const department = parts[0] as DepartmentId;
        const isDepartment = this.departments.some((item) => item.id === department);
        if (!isDepartment) return undefined;

        return {
          department,
          prompt: parts[1],
          type: 'Scenario',
          keywords: parts[2].split(',').map((keyword) => keyword.trim()).filter(Boolean),
          maxScore: Number(parts[3]) || 10,
        };
      })
      .filter((question): question is Question => Boolean(question));

    this.customQuestions.update((questions) => [...questions, ...parsed]);
    this.uploadMessage.set(`${parsed.length} custom questions added`);
    input.value = '';
  }

  exportResults(): void {
    const lines = [
      `Candidate: ${this.candidateName() || 'Practice Candidate'}`,
      `Department: ${this.activeDepartment().name}`,
      `Score: ${this.finalScore()}%`,
      `Band: ${this.resultBand()}`,
      '',
      ...this.answers().map(
        (answer, index) =>
          `${index + 1}. ${answer.question.prompt}\nRating: ${answer.rating}/5\nDuration: ${this.formatTime(answer.durationSeconds)}\nNotes: ${answer.notes || 'No notes'}`,
      ),
    ];
    this.downloadText('ground-staff-mock-result.txt', lines.join('\n\n'));
  }

  formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  private attachStream(): void {
    if (!this.cameraPreview?.nativeElement || !this.stream) return;
    this.cameraPreview.nativeElement.srcObject = this.stream;
  }

  private stopCamera(): void {
    this.stopRecording();
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = undefined;
    this.cameraReady.set(false);
  }

  private stopAndBuildVideoUrl(): Promise<string | undefined> {
    if (!this.recorder || !this.isRecording()) {
      return Promise.resolve(undefined);
    }

    return new Promise((resolve) => {
      const recorder = this.recorder;
      if (!recorder) {
        resolve(undefined);
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        resolve(blob.size ? URL.createObjectURL(blob) : undefined);
      };
      this.stopRecording();
    });
  }

  private shuffle<T>(items: T[]): T[] {
    return [...items].sort(() => Math.random() - 0.5);
  }

  private downloadText(fileName: string, text: string): void {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
