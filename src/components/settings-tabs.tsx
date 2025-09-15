'use client';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldOff, Users, HeartHandshake, Smartphone, PlusCircle, Trash2, Home, Briefcase } from "lucide-react";
import type { EmergencyContact, SafeZone, TrustedDevice } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface SettingsTabsProps {
  standbyMode: boolean;
  setStandbyMode: (value: boolean) => void;
  emergencyContacts: EmergencyContact[];
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
  safeZones: SafeZone[];
  setSafeZones: (zones: SafeZone[]) => void;
  trustedDevices: TrustedDevice[];
  setTrustedDevices: (devices: TrustedDevice[]) => void;
}

export function SettingsTabs({
  standbyMode,
  setStandbyMode,
  emergencyContacts,
  setEmergencyContacts,
  safeZones,
  setSafeZones,
  trustedDevices,
  setTrustedDevices,
}: SettingsTabsProps) {

  const getImageUrl = (id: string) => {
    const img = PlaceHolderImages.find(p => p.id === id);
    return img ? img.imageUrl : `https://picsum.photos/seed/${id}/40/40`;
  }
  const getImageHint = (id: string) => {
    const img = PlaceHolderImages.find(p => p.id === id);
    return img ? img.imageHint : `person`;
  }

  return (
    <Tabs defaultValue="standby" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="standby"><ShieldOff className="mr-2 h-4 w-4"/>Standby</TabsTrigger>
        <TabsTrigger value="contacts"><Users className="mr-2 h-4 w-4"/>Contacts</TabsTrigger>
        <TabsTrigger value="zones"><HeartHandshake className="mr-2 h-4 w-4"/>Safe Zones</TabsTrigger>
        <TabsTrigger value="devices"><Smartphone className="mr-2 h-4 w-4"/>Devices</TabsTrigger>
      </TabsList>
      <TabsContent value="standby">
        <Card>
          <CardHeader>
            <CardTitle>Standby Mode</CardTitle>
            <CardDescription>Temporarily disable automatic threat detection. Use this for situations like watching a movie or attending a concert to prevent false alarms.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2 rounded-lg border p-4">
              <Switch id="standby-mode" checked={standbyMode} onCheckedChange={setStandbyMode} />
              <Label htmlFor="standby-mode" className="text-lg">
                {standbyMode ? "Automatic triggers are OFF" : "Automatic triggers are ON"}
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">Manual activation is still available in Standby Mode.</p>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="contacts">
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contacts</CardTitle>
            <CardDescription>These people will be alerted when Shield Mode is activated.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {emergencyContacts.map(contact => (
              <div key={contact.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <Image src={getImageUrl(contact.avatar)} alt={contact.name} width={40} height={40} data-ai-hint={getImageHint(contact.avatar)} />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.phone}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4"/></Button>
              </div>
            ))}
             <div className="flex items-center space-x-2 pt-2">
                <Input placeholder="New Contact Name" />
                <Input placeholder="Phone Number" />
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="zones">
        <Card>
          <CardHeader>
            <CardTitle>Safe Zones</CardTitle>
            <CardDescription>Locations where system sensitivity is lowered to prevent false alarms.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {safeZones.map(zone => (
              <div key={zone.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="bg-secondary">
                    {zone.icon && <zone.icon className="h-5 w-5 text-secondary-foreground"/>}
                  </Avatar>
                  <div>
                    <p className="font-medium">{zone.name}</p>
                    <p className="text-sm text-muted-foreground">{zone.address}</p>
                  </div>
                </div>
                 <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4"/></Button>
              </div>
            ))}
             <div className="flex items-center space-x-2 pt-2">
                <Input placeholder="Zone Name (e.g., Library)" />
                <Input placeholder="Address" />
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="devices">
        <Card>
          <CardHeader>
            <CardTitle>Trusted Devices</CardTitle>
            <CardDescription>The presence of these devices helps the system distinguish consensual situations from threats, reducing the threat score.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {trustedDevices.map(device => (
              <div key={device.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <Avatar className="bg-secondary">
                    <Smartphone className="h-5 w-5 text-secondary-foreground"/>
                  </Avatar>
                  <div>
                    <p className="font-medium">{device.name}</p>
                    <p className="text-sm text-muted-foreground">Owner: {device.owner}</p>
                  </div>
                </div>
                 <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4"/></Button>
              </div>
            ))}
             <div className="flex items-center space-x-2 pt-2">
                <Input placeholder="Device Name (e.g., Alex's Pixel)" />
                <Input placeholder="Owner's Name" />
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
