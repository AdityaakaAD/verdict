'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ParticipantState } from '@verdict/shared';
import { JuryChamber } from '@/components/game/JuryChamber';
import { completeOnboarding } from '../actions';
import { useOnboarding } from '@/components/onboarding/onboarding-store';

const SELF_ID = 'tutorial-self';

const MOCK_PARTICIPANTS: ParticipantState[] = [
  {
    id: SELF_ID,
    userId: null,
    isBot: false,
    botPersona: null,
    alias: 'you',
    avatarId: 'scales',
    tier: 'citizen',
    statement: 'Stand your ground.',
    vote: 'b',
    initialVote: 'b',
    changedVoteDuringConversion: false,
    wasMinority: true,
    conversionsMade: 1,
    statementUpvotes: 5,
    scoreDelta: 25,
    isConnected: true,
  },
  {
    id: 'bot1',
    userId: null,
    isBot: true,
    botPersona: 'logical',
    alias: 'axiom',
    avatarId: 'compass',
    tier: 'juror',
    statement: 'Rules exist for a reason.',
    vote: 'a',
    initialVote: 'a',
    changedVoteDuringConversion: false,
    wasMinority: false,
    conversionsMade: 0,
    statementUpvotes: 2,
    scoreDelta: 0,
    isConnected: true,
  },
  {
    id: 'bot2',
    userId: null,
    isBot: true,
    botPersona: 'empathetic',
    alias: 'venn',
    avatarId: 'circle',
    tier: 'citizen',
    statement: null,
    vote: 'a',
    initialVote: 'b',
    changedVoteDuringConversion: true,
    wasMinority: false,
    conversionsMade: 0,
    statementUpvotes: 0,
    scoreDelta: 0,
    isConnected: true,
  },
  {
    id: 'bot3',
    userId: null,
    isBot: true,
    botPersona: 'contrarian',
    alias: 'rost',
    avatarId: 'diamond',
    tier: 'citizen',
    statement: 'Circumstances always matter.',
    vote: 'a',
    initialVote: 'a',
    changedVoteDuringConversion: false,
    wasMinority: false,
    conversionsMade: 0,
    statementUpvotes: 1,
    scoreDelta: 0,
    isConnected: true,
  },
  {
    id: 'bot4',
    userId: null,
    isBot: true,
    botPersona: 'logical',
    alias: 'mira',
    avatarId: 'hexagon',
    tier: 'juror',
    statement: null,
    vote: 'a',
    initialVote: 'a',
    changedVoteDuringConversion: false,
    wasMinority: false,
    conversionsMade: 0,
    statementUpvotes: 0,
    scoreDelta: 0,
    isConnected: true,
  },
  {
    id: 'bot5',
    userId: null,
    isBot: true,
    botPersona: 'pragmatic',
    alias: 'oryn',
    avatarId: 'triangle',
    tier: 'citizen',
    statement: null,
    vote: 'b',
    initialVote: 'a',
    changedVoteDuringConversion: true,
    wasMinority: false,
    conversionsMade: 0,
    statementUpvotes: 0,
    scoreDelta: 0,
    isConnected: true,
  },
];

const STEPS = [
  {
    title: 'Welcome to the jury chamber.',
    body: 'Six jurors deliberate on a real ethical scenario every night.',
    position: 'top' as const,
  },
  {
    title: 'Your seat is always at the center.',
    body: 'The other five jurors fill in around you — bots tonight, real people tomorrow.',
    position: 'top' as const,
  },
  {
    title: 'Read the scenario. Vote your conscience.',
    body: 'Pick a side. Write a statement. You have five minutes before the reveal.',
    position: 'bottom' as const,
  },
  {
    title: 'Try to persuade the room.',
    body: 'During conversion, others can flip to your side — or try to flip you.',
    position: 'bottom' as const,
  },
  {
    title: 'The minority can win.',
    body: 'Hold your ground and outlast the pressure. Conviction earns points too.',
    position: 'bottom' as const,
    isLast: true,
  },
];

interface ConfettiDot {
  id: number;
  x: number;
  color: string;
  delay: number;
}

const CONFETTI: ConfettiDot[] = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: 10 + (i / 17) * 80,
  color: i % 3 === 0 ? 'var(--accent)' : i % 3 === 1 ? 'var(--vote-b)' : 'var(--gold)',
  delay: i * 0.04,
}));

interface Props {
  onboardingData: {
    alias: string;
    avatarId: string;
    region: string;
    timezone: string;
    interests: string[];
  };
}

export function TutorialClient({ onboardingData }: Props) {
  const [step, setStep] = useState(0);
  const [won, setWon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { reset } = useOnboarding();

  const currentStep = STEPS[step];

  function advance() {
    if (!currentStep) return;
    if (currentStep.isLast) {
      setWon(true);
      setTimeout(() => {
        startTransition(async () => {
          const result = await completeOnboarding(onboardingData);
          if (result && result.ok === false) {
            setError(result.error);
            setWon(false);
          } else {
            reset();
          }
        });
      }, 1800);
      return;
    }
    setStep((s) => s + 1);
  }

  const phase = won ? 'result' : step >= 2 ? 'voting' : 'debate';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}
      onClick={won ? undefined : advance}
    >
      {/* 3D Chamber */}
      <div style={{ flex: 1 }}>
        <JuryChamber
          phase={phase}
          participants={MOCK_PARTICIPANTS}
          selfId={SELF_ID}
          minoritySide={won ? 'b' : null}
        />
      </div>

      {/* Win overlay */}
      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(10,10,11,0.75)',
              pointerEvents: 'none',
              zIndex: 20,
            }}
          >
            {/* Confetti */}
            {CONFETTI.map((dot) => (
              <motion.div
                key={dot.id}
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{ y: -160, opacity: 0, scale: 0.5 }}
                transition={{ delay: dot.delay, duration: 1.2, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  bottom: '45%',
                  left: `${dot.x}%`,
                  width: 6,
                  height: 6,
                  borderRadius: 2,
                  background: dot.color,
                }}
              />
            ))}

            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                fontWeight: 500,
                color: 'var(--text-primary)',
                textAlign: 'center',
              }}
            >
              You're ready to judge.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{ marginTop: 8, fontSize: 15, color: 'var(--text-secondary)' }}
            >
              {pending ? 'Opening the courtroom…' : 'Setting up your profile…'}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step tooltips */}
      {!won && currentStep && (
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ scale: 0.85, opacity: 0, y: currentStep.position === 'top' ? -12 : 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: currentStep.position === 'top' ? -12 : 12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: 20,
              right: 20,
              ...(currentStep.position === 'top' ? { top: 24 } : { bottom: 32 }),
              background: 'rgba(15,15,17,0.92)',
              border: '0.5px solid var(--border-subtle)',
              borderRadius: 12,
              padding: '16px 18px',
              backdropFilter: 'blur(12px)',
              zIndex: 15,
              cursor: 'default',
            }}
          >
            {/* Step indicator dots */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === step ? 16 : 4,
                    height: 4,
                    borderRadius: 2,
                    background: i === step ? 'var(--accent)' : 'var(--border-subtle)',
                    transition: 'width 0.2s, background 0.2s',
                  }}
                />
              ))}
            </div>

            <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {currentStep.title}
            </p>
            <p style={{ marginTop: 6, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {currentStep.body}
            </p>

            <button
              type="button"
              onClick={advance}
              style={{
                marginTop: 14,
                height: 36,
                paddingInline: 16,
                borderRadius: 8,
                background: currentStep.isLast ? 'var(--accent)' : 'var(--bg-tertiary)',
                border: 'none',
                color: currentStep.isLast ? '#fff' : 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {currentStep.isLast ? 'Enter the courtroom' : 'Next'}
            </button>
          </motion.div>
        </AnimatePresence>
      )}

      {error && (
        <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, textAlign: 'center', color: 'var(--accent)', fontSize: 13 }}>
          {error}
        </div>
      )}
    </div>
  );
}
