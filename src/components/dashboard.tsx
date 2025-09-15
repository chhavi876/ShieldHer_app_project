"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SettingsTabs } from "@/components/settings-tabs";
import { ShieldAlert, Mic, Move3d, MapPin, Smartphone, User, Home, Briefcase, HeartHandshake, ShieldCheck, Video, AlertCircle } from "lucide-react";
import { ShieldModeOverlay } from '@/components/shield-mode-overlay';
import type { EmergencyContact, SafeZone, TrustedDevice, SensorData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const motionPatterns = ["Stationary", "Walking", "Running", "Sudden fall", "Violent struggle"];
const locationContexts = ["In Safe Zone: Home", "In Safe Zone: Work", "Known area", "High-risk area", "Unknown area"];

const THRESHOLD = 100;
const VOLUME_THRESHOLD = -25; // in dBFS, a reasonable threshold for loud noise

export function Dashboard() {
  const [threatScore, setThreatScore] = useState(0);
  const [standbyMode, setStandbyMode] = useState(false);
  const [shieldModeActive, setShieldModeActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const [currentSensorData, setCurrentSensorData] = useState<SensorData>({
    acousticSignature: 'Normal',
    motionPattern: 'Stationary',
    locationContext: 'In Safe Zone: Home',
    trustedDevicesPresent: true,
    safeZoneStatus: 'In Safe Zone: Home',
  });

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'Jane Doe', phone: '555-1234', avatar: '1' },
    { id: '2', name: 'John Smith', phone: '555-5678', avatar: '2' },
  ]);
  const [safeZones, setSafeZones] = useState<SafeZone[]>([
    { id: '1', name: 'Home', address: '123 Main St, Anytown', icon: Home },
    { id: '2', name: 'Work', address: '456 Oak Ave, Anytown', icon: Briefcase },
  ]);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([
    { id: '1', name: 'Partner\'s Phone', owner: 'Jane Doe' },
  ]);

  const stopAudioProcessing = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setIsListening(false);
  }, []);

  const startAudioProcessing = useCallback(async () => {
    if (isListening || standbyMode) return;
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("getUserMedia not supported");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasMicPermission(true);

      audioContextRef.current = new window.AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setHasMicPermission(false);
      toast({
        variant: 'destructive',
        title: 'Microphone Access Denied',
        description: 'Please enable microphone permissions in your browser to use the audio analysis feature.',
      });
    }
  }, [isListening, standbyMode, toast]);

  const toggleListening = () => {
    if (isListening) {
      stopAudioProcessing();
    } else {
      startAudioProcessing();
    }
  }

  const calculateThreatScore = useCallback(() => {
    if (standbyMode) return 0;

    let score = 0;
    const data = { ...currentSensorData };

    // Update context based on settings
    const inSafeZone = safeZones.some(zone => data.locationContext.includes(zone.name));
    data.safeZoneStatus = inSafeZone ? `In Safe Zone: ${safeZones.find(z => data.locationContext.includes(z.name))?.name}` : 'Outside Safe Zone';

    // Weighted scoring based on current sensor data
    if (data.acousticSignature.includes('Loud')) score += 40;
    if (data.acousticSignature === 'Aggressive yelling' || data.acousticSignature === 'Breaking glass' || data.acousticSignature === 'Fearful scream') score += 25; // Keeping for simulation
    if (data.motionPattern === 'Violent struggle' || data.motionPattern === 'Sudden fall') score += 50;
    if (data.locationContext === 'High-risk area') score += 30;
    if (data.trustedDevicesPresent) score -= 30;
    if (inSafeZone) score -= 20;

    return Math.max(0, Math.min(150, score));
  }, [currentSensorData, standbyMode, safeZones]);

  useEffect(() => {
    const score = calculateThreatScore();
    setThreatScore(score);

    if (score >= THRESHOLD && !standbyMode) {
      setShieldModeActive(true);
    }
  }, [calculateThreatScore, standbyMode]);

  useEffect(() => {
    if (standbyMode || shieldModeActive) {
      stopAudioProcessing();
      return;
    }

    // Audio analysis loop
    let audioLoop: number;
    if (isListening && analyserRef.current && audioContextRef.current) {
      const analyser = analyserRef.current;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const analyse = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        const dBFS = 20 * Math.log10(average / 255);
        
        setCurrentSensorData(prev => ({
          ...prev,
          acousticSignature: dBFS > VOLUME_THRESHOLD ? 'Loud Event Detected' : 'Normal',
        }));
        audioLoop = requestAnimationFrame(analyse);
      };
      audioLoop = requestAnimationFrame(analyse);
    }

    // Motion and location simulation loop
    const simulationInterval = setInterval(() => {
      setCurrentSensorData(prev => ({
        ...prev,
        motionPattern: motionPatterns[Math.floor(Math.random() * motionPatterns.length)],
        locationContext: locationContexts[Math.floor(Math.random() * locationContexts.length)],
        trustedDevicesPresent: Math.random() > 0.5,
      }));
    }, 5000);

    return () => {
      cancelAnimationFrame(audioLoop);
      clearInterval(simulationInterval);
    }
  }, [isListening, standbyMode, shieldModeActive, stopAudioProcessing]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => stopAudioProcessing();
  }, [stopAudioProcessing]);


  const deactivateShieldMode = () => {
    setShieldModeActive(false);
    setThreatScore(0);
    setCurrentSensorData({
      acousticSignature: 'Normal',
      motionPattern: 'Stationary',
      locationContext: 'In Safe Zone: Home',
      trustedDevicesPresent: true,
      safeZoneStatus: 'In Safe Zone: Home',
    });
    // Re-enable listening if it was on before
    if(isListening) {
      startAudioProcessing();
    }
  };

  const scoreColor = threatScore < 50 ? 'text-green-500' : threatScore < THRESHOLD ? 'text-yellow-500' : 'text-red-500';

  return (
    <>
      {shieldModeActive && (
        <ShieldModeOverlay
          sensorData={currentSensorData}
          emergencyContacts={emergencyContacts}
          onDeactivate={deactivateShieldMode}
        />
      )}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Confidence</CardTitle>
            {threatScore >= THRESHOLD ? <ShieldAlert className="h-5 w-5 text-destructive" /> : <ShieldCheck className="h-5 w-5 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${scoreColor}`}>{threatScore}%</div>
            <p className="text-xs text-muted-foreground">Confidence score of a potential threat</p>
            <Progress value={threatScore} max={150} className="mt-4 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acoustic Signature</CardTitle>
            <Mic className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentSensorData.acousticSignature}</div>
            <p className="text-xs text-muted-foreground">Analyzing ambient sounds for distress signals</p>
            <Button size="sm" variant={isListening ? "secondary" : "outline"} onClick={toggleListening} className="mt-2" disabled={standbyMode}>
              {isListening ? 'Stop Listening' : 'Start Listening'}
            </Button>
            {hasMicPermission === false && (
              <p className="text-xs text-destructive mt-1">Mic permission denied.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Motion Pattern</CardTitle>
            <Move3d className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentSensorData.motionPattern}</div>
            <p className="text-xs text-muted-foreground">Detecting unusual or violent movements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location Context</CardTitle>
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentSensorData.safeZoneStatus}</div>
            <p className="text-xs text-muted-foreground">Cross-referencing GPS with user-defined zones</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>System Settings & Controls</CardTitle>
            <CardDescription>
              Manage your safety preferences, trusted network, and system status.
            </CardDescription>
          </CardHeader>
          <CardContent>
             {hasMicPermission === null && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Microphone Access</AlertTitle>
                  <AlertDescription>
                    To enable real-time threat detection, please allow microphone access when prompted.
                  </AlertDescription>
                </Alert>
              )}
            <SettingsTabs
              standbyMode={standbyMode}
              setStandbyMode={setStandbyMode}
              emergencyContacts={emergencyContacts}
              setEmergencyContacts={setEmergencyContacts}
              safeZones={safeZones}
              setSafeZones={setSafeZones}
              trustedDevices={trustedDevices}
              setTrustedDevices={setTrustedDevices}
            />
          </CardContent>
        </Card>
        <Card>
           <CardHeader>
            <CardTitle>Manual Activation</CardTitle>
             <CardDescription>
              Instantly trigger Shield Mode if you feel unsafe.
            </CardDescription>
          </Header>
          <CardContent className="flex flex-col items-center justify-center h-full pb-6">
            <Button size="lg" variant="destructive" className="h-24 w-full text-2xl" onClick={() => setShieldModeActive(true)}>
              <ShieldAlert className="mr-4 h-8 w-8" />
              Activate Shield Mode
            </Button>
            <p className="text-xs text-muted-foreground mt-4 text-center">Your emergency contacts will be notified immediately.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
