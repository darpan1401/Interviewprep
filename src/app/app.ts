import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GENERAL_QUESTIONS } from './general-questions';
import {
  AdminQuery,
  PublicQuery,
  QueryType,
  adminDelete,
  adminList,
  adminReply,
  fetchPublicQueries,
  isSupportConfigured,
  submitQuery,
} from './support-api';
import { ADMIN_HASH, LINKEDIN_URL } from './support.config';

type Stage = 'setup' | 'interview' | 'results';

type DepartmentId = 'general';

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
  notes: string;
  videoUrl?: string;
  extension: string;
  durationSeconds: number;
}

const DEPARTMENTS: Department[] = [
  {
    id: 'general',
    name: 'Airline Interview Questions',
    area: 'HR, situation based and airport knowledge questions',
    icon: 'GN',
    color: '#0f6b8a',
  },
];

const GENERAL_BANK: Question[] = GENERAL_QUESTIONS.map((item) => ({
  department: 'general' as const,
  prompt: item.prompt,
  type: item.type,
  keywords: item.keywords,
  maxScore: 10,
}));

type Phase = 'idle' | 'question' | 'answer';

interface RecordedMedia {
  url: string;
  extension: string;
}

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnDestroy {
  private cameraEl?: HTMLVideoElement;

  // Setter keeps the stream attached even if the <video> is created after the camera is ready
  // (this was one of the reasons the preview stayed black on phones).
  @ViewChild('cameraPreview')
  set cameraPreviewRef(ref: ElementRef<HTMLVideoElement> | undefined) {
    this.cameraEl = ref?.nativeElement;
    this.attachStream();
  }

  readonly departments = DEPARTMENTS;
  readonly examSizeOptions = [4, 6, 8, 10, 15, 20, 25, 30];
  readonly blinkOptions = [5, 6, 7, 8, 9, 10];
  readonly answerOptions = [30, 45, 60, 90, 120];

  readonly selectedDepartment = signal<DepartmentId>('general');
  readonly stage = signal<Stage>('setup');
  readonly candidateName = signal('');
  readonly examSize = signal(6);
  readonly blinkSeconds = signal(10);
  readonly answerSeconds = signal(45);
  readonly customQuestions = signal<Question[]>([]);
  readonly interviewQuestions = signal<Question[]>([]);
  readonly answers = signal<AnswerRecord[]>([]);
  readonly currentIndex = signal(0);
  readonly currentNotes = signal('');
  readonly cameraReady = signal(false);
  readonly cameraMessage = signal('');
  readonly isRecording = signal(false);
  readonly recordingSeconds = signal(0);
  readonly phase = signal<Phase>('idle');
  readonly secondsLeft = signal(0);
  readonly uploadMessage = signal('No custom file added');
  readonly previewIndex = signal(0);

  // ---------- support / help / admin ----------
  readonly linkedinUrl = LINKEDIN_URL;
  readonly supportConfigured = isSupportConfigured();
  readonly view = signal<'main' | 'admin'>('main');

  readonly supportType = signal<QueryType>('Help');
  readonly supportName = signal('');
  readonly supportEmail = signal('');
  readonly supportMessage = signal('');
  readonly supportWebsite = signal(''); // honeypot
  readonly supportStatus = signal<'idle' | 'sending' | 'sent' | 'error'>('idle');
  readonly supportError = signal('');
  readonly publicQueries = signal<PublicQuery[]>([]);
  readonly publicLoading = signal(false);
  readonly publicError = signal('');

  readonly adminId = signal('');
  readonly adminPassword = signal('');
  readonly adminLoggedIn = signal(false);
  readonly adminBusy = signal(false);
  readonly adminError = signal('');
  readonly adminQueries = signal<AdminQuery[]>([]);
  readonly replyDrafts = signal<Record<string, string>>({});

  private readonly onHashChange = () => this.syncView();

  private stream?: MediaStream;
  private recorder?: MediaRecorder;
  private chunks: Blob[] = [];
  private ticker?: number;
  private phaseEndsAt = 0;
  private questionStartedAt = 0;
  private advancing = false;

  readonly activeDepartment = computed(
    () => this.departments.find((department) => department.id === this.selectedDepartment()) ?? this.departments[0],
  );

  readonly availableCount = computed(
    () => this.allQuestions().filter((question) => question.department === this.selectedDepartment()).length,
  );

  readonly totalQuestionSeconds = computed(() => this.blinkSeconds() + this.answerSeconds());

  readonly currentQuestion = computed(() => this.interviewQuestions()[this.currentIndex()]);
  readonly progress = computed(() => {
    const total = this.interviewQuestions().length || 1;
    return Math.round(((this.currentIndex() + 1) / total) * 100);
  });

  readonly phaseProgress = computed(() => {
    const total = this.phase() === 'question' ? this.blinkSeconds() : this.answerSeconds();
    return total ? Math.round((this.secondsLeft() / total) * 100) : 0;
  });

  readonly previewAnswer = computed(() => this.answers()[this.previewIndex()]);

  constructor() {
    window.addEventListener('hashchange', this.onHashChange);
    this.syncView();
    void this.loadPublicQueries();
  }

  ngOnDestroy(): void {
    window.removeEventListener('hashchange', this.onHashChange);
    this.clearTicker();
    this.stopCamera();
  }

  // ---------- support / help ----------

  private syncView(): void {
    const isAdmin = window.location.hash === ADMIN_HASH;
    this.view.set(isAdmin ? 'admin' : 'main');
    if (!isAdmin) this.adminLogout(false);
  }

  async loadPublicQueries(): Promise<void> {
    if (!this.supportConfigured) return;
    this.publicLoading.set(true);
    this.publicError.set('');
    try {
      this.publicQueries.set(await fetchPublicQueries());
    } catch (error) {
      this.publicError.set(error instanceof Error ? error.message : 'Could not load questions.');
    } finally {
      this.publicLoading.set(false);
    }
  }

  async sendSupport(): Promise<void> {
    if (this.supportStatus() === 'sending') return;
    if (this.supportMessage().trim().length < 5) {
      this.supportStatus.set('error');
      this.supportError.set('Please write your question or the problem in a few words.');
      return;
    }
    this.supportStatus.set('sending');
    this.supportError.set('');
    try {
      await submitQuery({
        type: this.supportType(),
        name: this.supportName(),
        email: this.supportEmail(),
        message: this.supportMessage(),
        website: this.supportWebsite(),
      });
      this.supportStatus.set('sent');
      this.supportMessage.set('');
    } catch (error) {
      this.supportStatus.set('error');
      this.supportError.set(error instanceof Error ? error.message : 'Could not send your message.');
    }
  }

  // ---------- admin panel ----------

  async adminLogin(): Promise<void> {
    if (this.adminBusy()) return;
    this.adminBusy.set(true);
    this.adminError.set('');
    try {
      this.adminQueries.set(await adminList(this.adminId().trim(), this.adminPassword()));
      this.adminLoggedIn.set(true);
    } catch (error) {
      this.adminLoggedIn.set(false);
      this.adminError.set(error instanceof Error ? error.message : 'Login failed.');
    } finally {
      this.adminBusy.set(false);
    }
  }

  adminLogout(clearHash = true): void {
    this.adminLoggedIn.set(false);
    this.adminId.set('');
    this.adminPassword.set('');
    this.adminQueries.set([]);
    this.replyDrafts.set({});
    this.adminError.set('');
    if (clearHash && window.location.hash === ADMIN_HASH) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
      this.view.set('main');
    }
  }

  setReplyDraft(queryId: string, value: string): void {
    this.replyDrafts.update((drafts) => ({ ...drafts, [queryId]: value }));
  }

  replyText(item: AdminQuery): string {
    return this.replyDrafts()[item.id] ?? item.reply;
  }

  async saveReply(item: AdminQuery): Promise<void> {
    await this.runAdminAction(async () => {
      const items = await adminReply(this.adminId().trim(), this.adminPassword(), item.id, this.replyText(item));
      this.adminQueries.set(items);
      this.replyDrafts.update((drafts) => {
        const { [item.id]: _removed, ...rest } = drafts;
        return rest;
      });
      void this.loadPublicQueries();
    });
  }

  async removeQuery(item: AdminQuery): Promise<void> {
    if (!window.confirm('Delete this query permanently?')) return;
    await this.runAdminAction(async () => {
      this.adminQueries.set(await adminDelete(this.adminId().trim(), this.adminPassword(), item.id));
      void this.loadPublicQueries();
    });
  }

  private async runAdminAction(action: () => Promise<void>): Promise<void> {
    if (this.adminBusy()) return;
    this.adminBusy.set(true);
    this.adminError.set('');
    try {
      await action();
    } catch (error) {
      this.adminError.set(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      this.adminBusy.set(false);
    }
  }

  allQuestions(): Question[] {
    return [...GENERAL_BANK, ...this.customQuestions()];
  }

  selectDepartment(id: DepartmentId): void {
    this.selectedDepartment.set(id);
  }

  async startInterview(): Promise<void> {
    const pool = this.shuffle(this.allQuestions().filter((question) => question.department === this.selectedDepartment()));
    this.interviewQuestions.set(pool.slice(0, Math.min(this.examSize(), pool.length)));
    this.answers.set([]);
    this.previewIndex.set(0);
    this.currentIndex.set(0);
    this.currentNotes.set('');
    this.recordingSeconds.set(0);
    this.advancing = false;
    this.phase.set('idle');
    this.stage.set('interview');

    const ok = await this.enableCamera();
    // User may have pressed Exit while the permission prompt was open.
    if (this.stage() !== 'interview') return;
    if (ok) this.beginQuestion();
  }

  async retryCamera(): Promise<void> {
    const ok = await this.enableCamera();
    if (ok && this.stage() === 'interview' && this.phase() === 'idle') this.beginQuestion();
  }

  startWithoutCamera(): void {
    if (this.stage() === 'interview' && this.phase() === 'idle') this.beginQuestion();
  }

  async enableCamera(): Promise<boolean> {
    if (this.stream) {
      this.attachStream();
      return true;
    }

    this.cameraMessage.set('');

    if (!navigator.mediaDevices?.getUserMedia) {
      this.cameraMessage.set(
        window.isSecureContext
          ? 'This browser does not support camera access. Please use latest Chrome or Safari.'
          : 'Camera works only on HTTPS (or localhost). Please open the https:// link of the site on your phone.',
      );
      this.cameraReady.set(false);
      return false;
    }

    // Try from best to simplest constraints so that phones that reject 1280x720 or audio still work.
    const attempts: { constraints: MediaStreamConstraints; audioMissing: boolean }[] = [
      {
        constraints: { audio: true, video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } },
        audioMissing: false,
      },
      { constraints: { audio: true, video: { facingMode: 'user' } }, audioMissing: false },
      { constraints: { audio: true, video: true }, audioMissing: false },
      { constraints: { audio: false, video: true }, audioMissing: true },
    ];

    let lastError: unknown;
    for (const attempt of attempts) {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia(attempt.constraints);
        this.cameraReady.set(true);
        this.cameraMessage.set(attempt.audioMissing ? 'Microphone not available - recording video only.' : '');
        this.attachStream();
        return true;
      } catch (error) {
        lastError = error;
        const name = (error as DOMException | undefined)?.name;
        // Permission problems will not be solved by simpler constraints.
        if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'NotFoundError') break;
      }
    }

    this.cameraReady.set(false);
    this.cameraMessage.set(this.describeCameraError(lastError));
    return false;
  }

  async next(): Promise<void> {
    const question = this.currentQuestion();
    if (!question || this.advancing) return;
    this.advancing = true;
    this.clearTicker();

    const durationSeconds = this.questionStartedAt ? Math.round((Date.now() - this.questionStartedAt) / 1000) : 0;
    const media = await this.stopRecordingAndBuild();

    // User pressed Exit while the recording was being finalised.
    if (this.stage() !== 'interview') {
      if (media) URL.revokeObjectURL(media.url);
      return;
    }

    const record: AnswerRecord = {
      question,
      notes: this.currentNotes(),
      videoUrl: media?.url,
      extension: media?.extension ?? 'webm',
      durationSeconds,
    };

    this.answers.update((answers) => [...answers, record]);
    this.currentNotes.set('');

    if (this.currentIndex() + 1 >= this.interviewQuestions().length) {
      this.previewIndex.set(0);
      this.phase.set('idle');
      this.stage.set('results');
      this.stopCamera();
      this.advancing = false;
      return;
    }

    this.currentIndex.update((index) => index + 1);
    this.beginQuestion();
  }

  restart(): void {
    this.answers().forEach((answer) => {
      if (answer.videoUrl) URL.revokeObjectURL(answer.videoUrl);
    });
    this.clearTicker();
    this.advancing = false;
    this.phase.set('idle');
    this.stage.set('setup');
    this.answers.set([]);
    this.interviewQuestions.set([]);
    this.previewIndex.set(0);
    this.currentIndex.set(0);
    this.recordingSeconds.set(0);
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
      '# Department code: always write general',
      '#',
      '# EXAMPLE - You can copy this style:',
      '# general | Tell me about a time you helped a stranger. | situation, action, result | 10',
      '',
      '# EDITABLE QUESTIONS START BELOW',
      'general | Tell me about a time you worked under pressure. | situation, action, result, calm | 10',
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
      'Mock interview review notes (practice only, no score)',
      '',
      ...this.answers().map(
        (answer, index) =>
          `${index + 1}. ${answer.question.prompt}\nDuration: ${this.formatTime(answer.durationSeconds)}\nNotes: ${answer.notes || 'No notes'}`,
      ),
    ];
    this.downloadText('mock-interview-review.txt', lines.join('\n\n'));
  }

  formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  // ---------- question flow: blink -> hide -> answer -> next ----------

  /** Question starts blinking and the recording starts automatically. */
  private beginQuestion(): void {
    this.clearTicker();
    this.advancing = false;
    this.phase.set('question');
    this.secondsLeft.set(this.blinkSeconds());
    this.recordingSeconds.set(0);
    this.questionStartedAt = Date.now();
    this.phaseEndsAt = this.questionStartedAt + this.blinkSeconds() * 1000;
    this.startRecording();
    this.ticker = window.setInterval(() => this.tick(), 250);
  }

  private tick(): void {
    const now = Date.now();
    this.recordingSeconds.set(Math.floor((now - this.questionStartedAt) / 1000));

    const remainingMs = this.phaseEndsAt - now;
    this.secondsLeft.set(Math.max(0, Math.ceil(remainingMs / 1000)));
    if (remainingMs > 0) return;

    if (this.phase() === 'question') {
      // Blink time over: question is removed, answer time starts.
      this.phase.set('answer');
      this.phaseEndsAt = now + this.answerSeconds() * 1000;
      this.secondsLeft.set(this.answerSeconds());
    } else if (this.phase() === 'answer') {
      // Answer time over: save and move to next question automatically.
      void this.next();
    }
  }

  private clearTicker(): void {
    if (this.ticker !== undefined) window.clearInterval(this.ticker);
    this.ticker = undefined;
  }

  // ---------- camera / recording helpers ----------

  private attachStream(): void {
    const video = this.cameraEl;
    if (!video || !this.stream) return;

    // Angular does not always apply the `muted` attribute as a property; iOS/Android block autoplay without it.
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    if (video.srcObject !== this.stream) video.srcObject = this.stream;
    video.play().catch(() => undefined);
  }

  private describeCameraError(error: unknown): string {
    const name = (error as DOMException | undefined)?.name;
    switch (name) {
      case 'NotAllowedError':
      case 'SecurityError':
        return 'Camera/microphone permission is blocked. Allow it in the browser site settings and tap Retry camera.';
      case 'NotFoundError':
      case 'OverconstrainedError':
        return 'No camera found on this device.';
      case 'NotReadableError':
      case 'AbortError':
        return 'Camera is being used by another app. Close that app and tap Retry camera.';
      default:
        return 'Could not start the camera. Please check permission and tap Retry camera.';
    }
  }

  private pickMimeType(): string | undefined {
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4',
    ];
    return candidates.find((type) => MediaRecorder.isTypeSupported(type));
  }

  private startRecording(): void {
    this.chunks = [];
    this.recorder = undefined;
    this.isRecording.set(false);
    if (!this.stream) return;

    if (typeof MediaRecorder === 'undefined') {
      this.cameraMessage.set('Recording is not supported in this browser - preview only.');
      return;
    }

    try {
      const mimeType = this.pickMimeType();
      const recorder = mimeType ? new MediaRecorder(this.stream, { mimeType }) : new MediaRecorder(this.stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size) this.chunks.push(event.data);
      };
      recorder.start(1000);
      this.recorder = recorder;
      this.isRecording.set(true);
    } catch {
      this.recorder = undefined;
      this.cameraMessage.set('Could not start recording on this device.');
    }
  }

  private stopRecordingAndBuild(): Promise<RecordedMedia | undefined> {
    const recorder = this.recorder;
    this.recorder = undefined;

    if (!recorder || recorder.state === 'inactive') {
      this.isRecording.set(false);
      return Promise.resolve(undefined);
    }

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const type = recorder.mimeType || 'video/webm';
        const blob = new Blob(this.chunks, { type });
        this.chunks = [];
        this.isRecording.set(false);
        resolve(blob.size ? { url: URL.createObjectURL(blob), extension: type.includes('mp4') ? 'mp4' : 'webm' } : undefined);
      };
      try {
        recorder.stop();
      } catch {
        this.isRecording.set(false);
        resolve(undefined);
      }
    });
  }

  private discardRecording(): void {
    const recorder = this.recorder;
    this.recorder = undefined;
    this.chunks = [];
    this.isRecording.set(false);
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      recorder.ondataavailable = null;
      try {
        recorder.stop();
      } catch {
        // already stopped
      }
    }
  }

  private stopCamera(): void {
    this.discardRecording();
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = undefined;
    if (this.cameraEl) this.cameraEl.srcObject = null;
    this.cameraReady.set(false);
  }

  private shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
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
