
"use client";

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldAlert, Siren, FileVideo, MessageSquareWarning, CheckCircle2 } from 'lucide-react';
import * as Tone from 'tone';
import { sendAlertToContacts } from '@/ai/flows/send-alert-to-contacts';
import type { SensorData, EmergencyContact, Evidence } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ShieldModeOverlayProps {
  sensorData: SensorData;
  emergencyContacts: EmergencyContact[];
  onDeactivate: () => void;
}

type Stage = 'initializing' | 'capturing' | 'analyzing' | 'alerting' | 'active';

const CAPTURE_DURATION = 5000; // 5 seconds

export function ShieldModeOverlay({ sensorData, emergencyContacts, onDeactivate }: ShieldModeOverlayProps) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stage, setStage] = useState<Stage>('initializing');
  const sirenRef = useRef<Tone.Loop | null>(null);
  const [isSirenOn, setIsSirenOn] = useState(false);
  const { toast } = useToast();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const capturedEvidenceRef = useRef<Evidence | null>(null);
  const [isSequenceRunning, setIsSequenceRunning] = useState(false);


  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });

      } catch (error) {
        console.error('Error accessing camera/mic:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera & Mic Access Denied',
          description: 'Please enable permissions to capture evidence.',
        });
      }
    };

    getCameraPermission();

    return () => {
      mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    }
  }, [toast]);

  useEffect(() => {
    if (isSequenceRunning) return;
    
    const runSequence = async () => {
      setIsSequenceRunning(true);
      // 1. Evidence Capture
      setStage('capturing');
      
      let evidence: { video: string; } | null = null;

      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive' && hasCameraPermission) {
        const videoChunks: Blob[] = [];
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            videoChunks.push(event.data);
          }
        };

        const stopRecording = new Promise<void>(resolve => {
           mediaRecorderRef.current!.onstop = () => resolve();
        });

        mediaRecorderRef.current.start();
        await new Promise(resolve => setTimeout(resolve, CAPTURE_DURATION));
        if (mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        await stopRecording;
        
        if (videoChunks.length > 0) {
            const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
            const reader = new FileReader();
            evidence = await new Promise<{ video: string }>(resolve => {
              reader.onloadend = () => {
                const base64Video = reader.result as string;
                resolve({ video: base64Video });
              };
              reader.readAsDataURL(videoBlob);
            });
        }
      } 
      
      if (!evidence || !evidence.video) {
         await new Promise(resolve => setTimeout(resolve, CAPTURE_DURATION));
         evidence = { video: '' };
         toast({
          variant: 'destructive',
          title: 'Evidence Capture Failed',
          description: hasCameraPermission === false ? 'Camera/Mic permissions were denied.' : 'Could not start media recorder.',
        });
      }
      
      capturedEvidenceRef.current = { ...evidence, audio: '' };

      // 2. AI Analysis & Alerting
      setStage('analyzing');
      try {
          const evidenceToSend = capturedEvidenceRef.current.video ? { video: capturedEvidenceRef.current.video } : { video: ''};

          const result = await sendAlertToContacts({
              sensorData,
              evidence: evidenceToSend,
              emergencyContacts,
          });
          setSummary(result.message);
          toast({
            title: 'Alert Simulation',
            description: `(Simulated) Alert sent to: ${result.sentTo.join(', ')}`,
          });
      } catch (error) {
          console.error('AI alert failed:', error);
          setSummary('Could not generate AI summary. Alerting with raw data.');
          toast({
              variant: 'destructive',
              title: 'AI Analysis Error',
              description: 'Failed to generate the incident alert message.',
          });
      }
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Alerting Stage Display
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
    }
  }, [isSequenceRunning, sensorData, emergencyContacts, toast, hasCameraPermission]);
  
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
    alerting: { icon: <MessageSquareWarning className="h-6 w-6" />, text: 'Sending AI-powered alerts...' },
    active: { icon: <CheckCircle2 className="h-6 w-6 text-green-400" />, text: 'Shield Mode is Active. Alerts Sent.' },
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-flash p-8 text-white">
      <div className="text-center">
        <ShieldAlert className="mx-auto h-24 w-24" />
        <h1 className="mt-4 text-5xl font-bold tracking-tighter">SHIELD MODE ACTIVATED</h1>
        <p className="mt-2 text-xl opacity-90">A potential threat has been detected.</p>
      </div>

      <div className="mt-12 w-full max-w-3xl rounded-lg bg-black/50 p-6 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-lg font-semibold text-center mb-4">Live Evidence Capture</h2>
              <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted playsInline />
              {hasCameraPermission === false && (
                  <Alert variant="destructive" className="mt-2">
                      <AlertTitle>Camera Access Denied</AlertTitle>
                      <AlertDescription>
                          Evidence capture is disabled.
                      </AlertDescription>
                  </Alert>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-center mb-4">Response Protocol Status</h2>
              <div className="flex items-center justify-center gap-4 text-xl font-medium">
                {stageInfo[stage].icon}
                <p>{stageInfo[stage].text}</p>
              </div>

              {summary && (
                <div className="mt-4 rounded-md border border-white/20 bg-white/10 p-4 max-h-48 overflow-y-auto">
                  <p className="text-sm font-semibold opacity-80">AI-Generated Message Sent to Contacts:</p>
                  <p className="italic">"{summary}"</p>
                </div>
              )}
            </div>
        </div>
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
