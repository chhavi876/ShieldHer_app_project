import type { LucideIcon } from 'lucide-react';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
}

export interface SafeZone {
  id: string;
  name: string;
  address: string;
  icon: LucideIcon;
}

export interface TrustedDevice {
  id: string;
  name: string;
  owner: string;
}

export interface SensorData {
  acousticSignature: string;
  motionPattern: string;
  locationContext: string;
  trustedDevicesPresent: boolean;
  safeZoneStatus: string;
}
