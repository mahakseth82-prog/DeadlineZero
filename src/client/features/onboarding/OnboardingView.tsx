/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Bot, User, CheckCircle2, ShieldCheck, Target } from 'lucide-react';

export const OnboardingView: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, setOnboarded } = useAuthStore();
  const { addToast } = useUiStore();

  const [step, setStep] = useState(1);
  const [occupation, setOccupation] = useState('University Student');
  const [goalInput, setGoalInput] = useState('');
  const [goals, setGoals] = useState<string[]>([
    'Avoid missing critical project deadlines',
    'Build a structured study routine'
  ]);
  const [workingStart, setWorkingStart] = useState('09:00');
  const [workingEnd, setWorkingEnd] = useState('17:00');
  const [generatingProfile, setGeneratingProfile] = useState(false);

  const addGoal = () => {
    if (goalInput.trim()) {
      setGoals([...goals, goalInput.trim()]);
      setGoalInput('');
    }
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    setGeneratingProfile(true);
    
    // Simulate Gemini Onboarding profile generation
    setTimeout(() => {
      updateProfile({
        occupation,
        goals,
        workingHoursStart: workingStart,
        workingHoursEnd: workingEnd,
        productivityScore: 75,
        focusScore: 80,
      });
      setOnboarded(true);
      setGeneratingProfile(false);
      addToast('Profile Created', 'Successfully generated your risk analysis profile!', 'success');
      navigate('/app/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex justify-center items-center p-6">
      <div className="w-full max-w-xl flex flex-col gap-6">
        
        {/* Progress tracker */}
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-semibold text-zinc-400">AI Profile Generation</span>
          <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">Step {step} of 3</span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-zinc-900 dark:bg-zinc-100 h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <Card variant="default" className="relative overflow-hidden min-h-[400px] flex flex-col justify-between">
          
          {generatingProfile ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center my-auto">
              <Bot className="w-12 h-12 text-zinc-800 dark:text-zinc-100 animate-bounce" />
              <h2 className="font-bold text-lg text-zinc-900 dark:text-white">Synthesizing Profile...</h2>
              <p className="text-xs text-zinc-400 max-w-sm">
                Our AI Triage system is parsing your hours, occupation hazards, and focus indicators to produce recommendations.
              </p>
            </div>
          ) : (
            <>
              {/* Step 1: Occupation & Routine */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                      Work Identity
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Tell us your role so the model can gauge your workload volatility.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Occupation / Title"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="e.g. University Student, Freelance Writer"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Work Window Start"
                        type="time"
                        value={workingStart}
                        onChange={(e) => setWorkingStart(e.target.value)}
                      />
                      <Input
                        label="Work Window End"
                        type="time"
                        value={workingEnd}
                        onChange={(e) => setWorkingEnd(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Goal Alignment */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                      Target Milestones
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      What productivity milestones are you optimizing for?
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        placeholder="e.g. Pass final exams without cramming"
                        onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                      />
                      <Button onClick={addGoal} size="sm">Add</Button>
                    </div>

                    <div className="space-y-2 max-h-[180px] overflow-y-auto">
                      {goals.map((g, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg text-xs"
                        >
                          <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate">{g}</span>
                          <button 
                            onClick={() => removeGoal(index)} 
                            className="text-red-500 hover:text-red-700 text-xs px-2"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Diagnostic Report Preview */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      Risk Baseline Ready
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Confirming your options will activate protective scheduling controls.
                    </p>
                  </div>

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-medium">Predicted Risk Score:</span>
                      <span className="text-emerald-500 font-bold">25% (Low Risk)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 font-medium">Calculated Focus Windows:</span>
                      <span className="font-bold text-zinc-800 dark:text-white">8 Focus Hours Daily</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-1">
                      Based on your role as a <strong className="text-zinc-700 dark:text-zinc-300">{occupation}</strong>, DeadlineZero will highlight visual indicators during late afternoon blocks when your energy drops.
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Nav */}
              <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBack} 
                  disabled={step === 1}
                >
                  Back
                </Button>
                <Button 
                  variant={step === 3 ? 'accent' : 'primary'} 
                  size="sm" 
                  onClick={handleNext}
                >
                  {step === 3 ? 'Generate Profile' : 'Next'}
                </Button>
              </div>
            </>
          )}

        </Card>
      </div>
    </div>
  );
};
