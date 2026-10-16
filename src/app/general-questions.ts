export type GeneralQuestionType = 'HR' | 'Scenario' | 'Safety' | 'Operations';

export interface GeneralQuestionSeed {
  prompt: string;
  type: GeneralQuestionType;
  keywords: string[];
}

export const GENERAL_QUESTIONS: GeneralQuestionSeed[] = [
  // ---------- Scenario ----------
  {
    prompt: 'One day while working you saw passengers fighting with each other. What will you do?',
    type: 'Scenario',
    keywords: ['stay calm', 'separate safely', 'security', 'report', 'passenger safety'],
  },
  {
    prompt: 'One day you saw some passengers involved in smuggling activities. What will you do?',
    type: 'Scenario',
    keywords: ['do not confront', 'report', 'security', 'customs', 'observe'],
  },
  {
    prompt: 'One day while working a fire occurs inside the airport. What will you do?',
    type: 'Safety',
    keywords: ['alarm', 'evacuation', 'passengers first', 'fire team', 'stay calm'],
  },
  {
    prompt: 'One day you saw a passenger leave his phone at the airport by mistake. What will you do?',
    type: 'Scenario',
    keywords: ['do not use', 'lost and found', 'announce', 'handover', 'honesty'],
  },
  {
    prompt: 'One day a passenger slaps you because of a flight delay. What will you do?',
    type: 'Scenario',
    keywords: ['stay calm', 'no retaliation', 'supervisor', 'security', 'report incident'],
  },
  {
    prompt:
      'One day while giving an interview you saw militants enter the hotel and start firing. What will you do in this situation?',
    type: 'Safety',
    keywords: ['stay calm', 'hide', 'exits', 'inform police', 'safety first'],
  },
  {
    prompt: 'One day you saw two passengers fighting at the airport. What would you do?',
    type: 'Scenario',
    keywords: ['calm', 'security', 'do not take sides', 'report', 'safety'],
  },
  {
    prompt: 'One day while working you saw your elder brother or sister involved in smuggling activities. What will you do?',
    type: 'Scenario',
    keywords: ['duty first', 'report', 'integrity', 'law', 'honesty'],
  },
  {
    prompt: 'One day you saw a flight got delayed and passengers started abusing. What will you do?',
    type: 'Scenario',
    keywords: ['empathy', 'information', 'calm', 'options', 'supervisor'],
  },
  {
    prompt: 'One day you saw a passenger become unconscious at the airport. What will you do?',
    type: 'Safety',
    keywords: ['check response', 'call medical team', 'first aid', 'give space', 'report'],
  },
  {
    prompt: 'Tell me how you will request your manager to increase the deadline when the task given by him is not completed.',
    type: 'Scenario',
    keywords: ['honest', 'reason', 'new timeline', 'early update', 'solution'],
  },

  // ---------- HR ----------
  {
    prompt: 'Tell me why you are so late to join airlines. Why did you not give an interview earlier?',
    type: 'HR',
    keywords: ['honest reason', 'experience gained', 'maturity', 'commitment', 'positive'],
  },
  {
    prompt: 'Tell me why you want to leave your job and why you want to join the airline only, why not another field?',
    type: 'HR',
    keywords: ['growth', 'passion', 'aviation', 'service', 'long term'],
  },
  {
    prompt: 'Tell me what you have learned in your past job.',
    type: 'HR',
    keywords: ['teamwork', 'responsibility', 'communication', 'discipline', 'skills'],
  },
  {
    prompt: 'Tell me why you left your previous job.',
    type: 'HR',
    keywords: ['positive reason', 'growth', 'no blame', 'learning', 'new challenge'],
  },
  {
    prompt: 'Tell me about your salary expectation.',
    type: 'HR',
    keywords: ['as per company norms', 'learning', 'flexible', 'skills', 'growth'],
  },
  {
    prompt: 'Tell me what you do when you do not feel good or get demotivated.',
    type: 'HR',
    keywords: ['self motivation', 'family', 'goals', 'positive', 'rest'],
  },
  {
    prompt: 'Tell me about yourself.',
    type: 'HR',
    keywords: ['name', 'education', 'experience', 'strengths', 'goal'],
  },
  {
    prompt: 'Introduce yourself.',
    type: 'HR',
    keywords: ['name', 'education', 'family', 'skills', 'goal'],
  },
  {
    prompt: 'Tell me what things you will learn after getting this job.',
    type: 'HR',
    keywords: ['customer handling', 'procedures', 'teamwork', 'discipline', 'safety'],
  },
  {
    prompt: 'Tell me any one thing which is not mentioned in your CV.',
    type: 'HR',
    keywords: ['hobby', 'skill', 'achievement', 'volunteering', 'honest'],
  },
  {
    prompt: 'Tell me the worst day of your life.',
    type: 'HR',
    keywords: ['honest', 'what you learned', 'strength', 'recovery', 'positive ending'],
  },
  {
    prompt: 'Tell me the best day of your life.',
    type: 'HR',
    keywords: ['achievement', 'family', 'gratitude', 'motivation', 'specific moment'],
  },
  {
    prompt: 'Tell me what you did yesterday, one day before this interview.',
    type: 'HR',
    keywords: ['preparation', 'research', 'rest', 'documents', 'confidence'],
  },
  {
    prompt: 'Tell me how you will utilise your first salary.',
    type: 'HR',
    keywords: ['family', 'savings', 'gratitude', 'responsibility', 'planning'],
  },
  {
    prompt: 'Give me one real-life example where you have shown honesty.',
    type: 'HR',
    keywords: ['situation', 'action', 'result', 'integrity', 'learning'],
  },
  {
    prompt: 'Tell me how much you want to rate yourself in teamwork.',
    type: 'HR',
    keywords: ['honest rating', 'example', 'cooperation', 'listening', 'improve'],
  },
  {
    prompt: 'Tell me 2 bad qualities of your friends.',
    type: 'HR',
    keywords: ['tactful', 'minor habits', 'respectful', 'no harsh words', 'positive spin'],
  },
  {
    prompt: 'Tell me 2 bad qualities of your teacher.',
    type: 'HR',
    keywords: ['respect', 'minor points', 'constructive', 'tactful', 'learning'],
  },
  {
    prompt: 'Tell me 2 bad qualities of your parents.',
    type: 'HR',
    keywords: ['respect', 'tactful', 'minor points', 'gratitude', 'positive'],
  },
  {
    prompt: 'Tell me what things you would change if you went back to your school days.',
    type: 'HR',
    keywords: ['discipline', 'studies', 'skills', 'time management', 'learning'],
  },
  {
    prompt: 'If a person is criticising you, how will you react?',
    type: 'HR',
    keywords: ['listen', 'stay calm', 'accept feedback', 'improve', 'no argument'],
  },
  {
    prompt: 'Why should we hire you?',
    type: 'HR',
    keywords: ['skills', 'attitude', 'dedication', 'teamwork', 'learning'],
  },
  {
    prompt: 'Tell me about your strengths.',
    type: 'HR',
    keywords: ['communication', 'discipline', 'adaptability', 'examples', 'teamwork'],
  },
  {
    prompt: 'Tell me something about your family background.',
    type: 'HR',
    keywords: ['family members', 'values', 'support', 'occupation', 'proud'],
  },
  {
    prompt: 'Tell me what teamwork is and give me a real-life example where you have worked in a team.',
    type: 'HR',
    keywords: ['common goal', 'cooperation', 'roles', 'communication', 'result'],
  },
  {
    prompt: 'Tell me why you want to join our airline. Why not others?',
    type: 'HR',
    keywords: ['airline research', 'values', 'service', 'growth', 'reputation'],
  },
  {
    prompt: 'Tell me where you want to see yourself after 5 years.',
    type: 'HR',
    keywords: ['growth', 'responsibility', 'learning', 'same airline', 'goal'],
  },
  {
    prompt: 'Tell me about your 5 weaknesses.',
    type: 'HR',
    keywords: ['honest', 'improving', 'real weaknesses', 'steps taken', 'self aware'],
  },
  {
    prompt: 'Tell me about your 5 strengths.',
    type: 'HR',
    keywords: ['communication', 'discipline', 'positive attitude', 'punctuality', 'examples'],
  },
  {
    prompt: 'Give me a real-life example where you have shown punctuality.',
    type: 'HR',
    keywords: ['situation', 'on time', 'planning', 'respect for time', 'result'],
  },
  {
    prompt: 'Tell me why a smile is important in the aviation industry.',
    type: 'HR',
    keywords: ['first impression', 'welcome', 'comfort', 'trust', 'brand'],
  },

  // ---------- Operations / airport knowledge ----------
  {
    prompt: 'What is a runway?',
    type: 'Operations',
    keywords: ['rectangular area', 'take-off', 'landing', 'aerodrome', 'aircraft'],
  },
  {
    prompt: 'What is an airport?',
    type: 'Operations',
    keywords: ['aircraft arrival', 'departure', 'terminal', 'passengers', 'cargo'],
  },
  {
    prompt: 'What is an aerodrome?',
    type: 'Operations',
    keywords: ['defined area', 'land or water', 'buildings', 'arrival and departure', 'surface movement'],
  },
  {
    prompt: 'What is a terminal building?',
    type: 'Operations',
    keywords: ['passengers', 'check-in', 'security check', 'boarding gates', 'baggage'],
  },
  {
    prompt: 'What is a ramp?',
    type: 'Operations',
    keywords: ['apron', 'aircraft parking', 'loading', 'unloading', 'refuelling'],
  },
  {
    prompt: 'What is a bay?',
    type: 'Operations',
    keywords: ['aircraft parking position', 'stand', 'apron', 'turnaround', 'marked'],
  },
  {
    prompt: 'What is the full form of ATS and what does it mean?',
    type: 'Operations',
    keywords: ['Air Traffic Services', 'air traffic control', 'flight information', 'alerting service', 'safe separation'],
  },
  {
    prompt: 'What is the full form of CISF?',
    type: 'Operations',
    keywords: ['Central Industrial Security Force', 'airport security', 'screening', 'protection'],
  },
  {
    prompt: 'What is a hangar?',
    type: 'Operations',
    keywords: ['aircraft shelter', 'maintenance', 'storage', 'covered building', 'engineers'],
  },
  {
    prompt: 'Tell me what aviation security and airline security are.',
    type: 'Safety',
    keywords: ['unlawful interference', 'passengers', 'aircraft', 'screening', 'vigilance'],
  },
  {
    prompt: 'What is customer service? Give me a real-life example where you have shown excellent customer service.',
    type: 'HR',
    keywords: ['helping customers', 'empathy', 'solution', 'politeness', 'example'],
  },
];
