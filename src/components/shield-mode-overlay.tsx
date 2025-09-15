"use client";

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert, Siren, FileVideo, MessageSquareWarning, CheckCircle2 } from 'lucide-react';
import * as Tone from 'tone';
import { summarizeIncidentForContacts } from '@/ai/flows/summarize-incident-for-contacts';
import type { SensorData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ShieldModeOverlayProps {
  sensorData: SensorData;
  onDeactivate: () => void;
}

type Stage = 'initializing' | 'capturing' | 'analyzing' | 'alerting' | 'active';

export function ShieldModeOverlay({ sensorData, onDeactivate }: ShieldModeOverlayProps) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stage, setStage] = useState<Stage>('initializing');
  const sirenRef = useRef<Tone.Loop | null>(null);
  const [isSirenOn, setIsSirenOn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const runSequence = async () => {
      // 1. Evidence Capture
      setStage('capturing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 2. AI Analysis
      setStage('analyzing');
      try {
        const result = await summarizeIncidentForContacts(sensorData);
        setSummary(result.summary);
      } catch (error) {
        console.error('AI summary failed:', error);
        setSummary('Could not generate AI summary. Alerting with raw data.');
        toast({
          variant: 'destructive',
          title: 'AI Analysis Error',
          description: 'Failed to generate the incident summary.',
        });
      }
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Alerting
      setStage('alerting');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 4. Active
      setStage('active');
      setIsLoading(false);
    };

    runSequence();
    
    // Cleanup Tone.js context on unmount
    return () => {
      sirenRef.current?.stop().dispose();
      Tone.context.dispose();
    }
  }, [sensorData, toast]);
  
  const toggleSiren = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }

    if (isSirenOn) {
      sirenRef.current?.stop();
      setIsSirenOn(false);
    } else {
      if (!sirenRef.current) {
        const synth = new Tone.Synth().toDestination();
        sirenRef.current = new Tone.Loop(time => {
            synth.triggerAttackRelease("A5", "8n", time);
            synth.triggerAttackRelease("G5", "8n", time + 0.2);
        }, "0.4s");
      }
      sirenRef.current.start(0);
      Tone.Transport.start();
      setIsSirenOn(true);
    }
  };

  const stageInfo = {
    initializing: { icon: <Loader2 className="h-6 w-6 animate-spin" />, text: 'Initializing Shield Mode...' },
    capturing: { icon: <FileVideo className="h-6 w-6" />, text: 'Capturing video evidence...' },
    analyzing: { icon: <Loader2 className="h-6 w-6 animate-spin" />, text: 'AI analyzing incident...' },
    alerting: { icon: <MessageSquareWarning className="h-6 w-6" />, text: 'Alerting emergency contacts...' },
    active: { icon: <CheckCircle2 className="h-6 w-6 text-green-400" />, text: 'Shield Mode is Active. Alerts Sent.' },
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-flash p-8 text-white">
      <div className="text-center">
        <ShieldAlert className="mx-auto h-24 w-24" />
        <h1 className="mt-4 text-5xl font-bold tracking-tighter">SHIELD MODE ACTIVATED</h1>
        <p className="mt-2 text-xl opacity-90">A potential threat has been detected.</p>
      </div>

      <div className="mt-12 w-full max-w-2xl rounded-lg bg-black/50 p-6 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-center mb-4">Response Protocol Status</h2>
        <div className="flex items-center justify-center gap-4 text-xl font-medium">
          {stageInfo[stage].icon}
          <p>{stageInfo[stage].text}</p>
        </div>

        {summary && (
          <div className="mt-4 rounded-md border border-white/20 bg-white/10 p-4">
            <p className="text-sm font-semibold opacity-80">AI-Generated Summary for Contacts:</p>
            <p className="italic">"{summary}"</p>
          </div>
        )}
      </div>

      <div className="mt-12 flex flex-col sm:flex-row gap-6">
        <Button 
          variant={isSirenOn ? 'outline' : 'secondary'} 
          className="h-16 w-64 text-xl" 
          onClick={toggleSiren}
          disabled={isLoading}
        >
          <Siren className="mr-3 h-7 w-7" />
          {isSirenOn ? 'Stop Siren' : 'Activate Siren'}
        </Button>
        <Button 
          variant="outline"
          className="h-16 w-64 text-xl bg-transparent hover:bg-white hover:text-black"
          onClick={onDeactivate}
          disabled={isLoading}
        >
          Deactivate
        </Button>
      </div>
      <p className="mt-6 text-center text-sm opacity-80">Only deactivate if you are safe. A deactivation notice will be sent to your contacts.</p>
    </div>
  );
}
