"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SettingsTabs } from "@/components/settings-tabs";
import { ShieldAlert, Mic, Move3d, MapPin, Smartphone, User, Home, Briefcase, HeartHandshake, ShieldCheck } from "lucide-react";
import { ShieldModeOverlay } from '@/components/shield-mode-overlay';
import type { EmergencyContact, SafeZone, TrustedDevice, SensorData } from '@/lib/types';

const acousticSignatures = ["Normal conversation", "Loud music", "Traffic noise", "Breaking glass", "Aggressive yelling", "Fearful scream"];
const motionPatterns = ["Stationary", "Walking", "Running", "Sudden fall", "Violent struggle"];
const locationContexts = ["In Safe Zone: Home", "In Safe Zone: Work", "Known area", "High-risk area", "Unknown area"];

const THRESHOLD = 100;

export function Dashboard() {
  const [threatScore, setThreatScore] = useState(0);
  const [standbyMode, setStandbyMode] = useState(false);
  const [shieldModeActive, setShieldModeActive] = useState(false);
  const [currentSensorData, setCurrentSensorData] = useState<SensorData>({
    acousticSignature: 'Normal conversation',
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

  const calculateThreatScore = useCallback(() => {
    if (standbyMode) return 0;

    let score = 0;
    const data = { ...currentSensorData };

    // Update context based on settings
    const inSafeZone = safeZones.some(zone => data.locationContext.includes(zone.name));
    data.safeZoneStatus = inSafeZone ? `In Safe Zone: ${safeZones.find(z => data.locationContext.includes(z.name))?.name}` : 'Outside Safe Zone';

    // Weighted scoring
    if (data.acousticSignature === 'Fearful scream') score += 40;
    if (data.acousticSignature === 'Aggressive yelling' || data.acousticSignature === 'Breaking glass') score += 25;
    if (data.motionPattern === 'Violent struggle' || data.motionPattern === 'Sudden fall') score += 50;
    if (data.locationContext === 'High-risk area') score += 30;
    if (data.trustedDevicesPresent) score -= 30;
    if (inSafeZone) score -= 20;

    return Math.max(0, Math.min(150, score)); // Cap score between 0 and 150
  }, [currentSensorData, standbyMode, safeZones]);

  useEffect(() => {
    const score = calculateThreatScore();
    setThreatScore(score);

    if (score >= THRESHOLD && !standbyMode) {
      setShieldModeActive(true);
    }
  }, [calculateThreatScore, standbyMode]);

  useEffect(() => {
    if (standbyMode || shieldModeActive) return;

    const simulationInterval = setInterval(() => {
      setCurrentSensorData({
        acousticSignature: acousticSignatures[Math.floor(Math.random() * acousticSignatures.length)],
        motionPattern: motionPatterns[Math.floor(Math.random() * motionPatterns.length)],
        locationContext: locationContexts[Math.floor(Math.random() * locationContexts.length)],
        trustedDevicesPresent: Math.random() > 0.5,
        safeZoneStatus: 'Outside Safe Zone'
      });
    }, 3000);

    return () => clearInterval(simulationInterval);
  }, [standbyMode, shieldModeActive]);

  const deactivateShieldMode = () => {
    setShieldModeActive(false);
    setThreatScore(0);
    setCurrentSensorData({
      acousticSignature: 'Normal conversation',
      motionPattern: 'Stationary',
      locationContext: 'In Safe Zone: Home',
      trustedDevicesPresent: true,
      safeZoneStatus: 'In Safe Zone: Home',
    });
  };

  const scoreColor = threatScore < 50 ? 'text-green-500' : threatScore < THRESHOLD ? 'text-yellow-500' : 'text-red-500';

  return (
    <>
      {shieldModeActive && (
        <ShieldModeOverlay
          sensorData={currentSensorData}
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
          </CardHeader>
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
