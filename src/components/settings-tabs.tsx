'use client';
import Image from 'next/image';
import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneAddress, setNewZoneAddress] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceOwner, setNewDeviceOwner] = useState('');


  const getImageUrl = (id: string) => {
    const img = PlaceHolderImages.find(p => p.id === id);
    return img ? img.imageUrl : `https://picsum.photos/seed/${id}/40/40`;
  }
  const getImageHint = (id: string) => {
    const img = PlaceHolderImages.find(p => p.id === id);
    return img ? img.imageHint : `person`;
  }

  const handleAddContact = () => {
    if (!newContactName || !newContactPhone) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a name and phone number.' });
      return;
    }
    const newContact: EmergencyContact = {
      id: (emergencyContacts.length + 1).toString(),
      name: newContactName,
      phone: newContactPhone,
      avatar: (Math.floor(Math.random() * 1000)).toString(),
    };
    setEmergencyContacts([...emergencyContacts, newContact]);
    setNewContactName('');
    setNewContactPhone('');
    toast({ title: 'Success', description: 'Emergency contact added.' });
  };

  const handleDeleteContact = (id: string) => {
    setEmergencyContacts(emergencyContacts.filter(contact => contact.id !== id));
    toast({ title: 'Success', description: 'Emergency contact removed.' });
  };

  const handleAddSafeZone = () => {
    if (!newZoneName || !newZoneAddress) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a zone name and address.' });
      return;
    }
    const newZone: SafeZone = {
      id: (safeZones.length + 1).toString(),
      name: newZoneName,
      address: newZoneAddress,
      icon: newZoneName.toLowerCase().includes('work') ? Briefcase : Home,
    };
    setSafeZones([...safeZones, newZone]);
    setNewZoneName('');
    setNewZoneAddress('');
    toast({ title: 'Success', description: 'Safe zone added.' });
  };

  const handleDeleteSafeZone = (id: string) => {
    setSafeZones(safeZones.filter(zone => zone.id !== id));
    toast({ title: 'Success', description: 'Safe zone removed.' });
  };

  const handleAddTrustedDevice = () => {
    if (!newDeviceName || !newDeviceOwner) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a device name and owner.' });
      return;
    }
    const newDevice: TrustedDevice = {
      id: (trustedDevices.length + 1).toString(),
      name: newDeviceName,
      owner: newDeviceOwner,
    };
    setTrustedDevices([...trustedDevices, newDevice]);
    setNewDeviceName('');
    setNewDeviceOwner('');
    toast({ title: 'Success', description: 'Trusted device added.' });
  };

  const handleDeleteTrustedDevice = (id: string) => {
    setTrustedDevices(trustedDevices.filter(device => device.id !== id));
    toast({ title: 'Success', description: 'Trusted device removed.' });
  };


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
                <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)}><Trash2 className="h-4 w-4"/></Button>
              </div>
            ))}
             <div className="flex items-center space-x-2 pt-2">
                <Input placeholder="New Contact Name" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} />
                <Input placeholder="Phone Number" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} />
                <Button onClick={handleAddContact}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
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
                 <Button variant="ghost" size="icon" onClick={() => handleDeleteSafeZone(zone.id)}><Trash2 className="h-4 w-4"/></Button>
              </div>
            ))}
             <div className="flex items-center space-x-2 pt-2">
                <Input placeholder="Zone Name (e.g., Library)" value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} />
                <Input placeholder="Address" value={newZoneAddress} onChange={(e) => setNewZoneAddress(e.target.value)} />
                <Button onClick={handleAddSafeZone}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
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
                 <Button variant="ghost" size="icon" onClick={() => handleDeleteTrustedDevice(device.id)}><Trash2 className="h-4 w-4"/></Button>
              </div>
            ))}
             <div className="flex items-center space-x-2 pt-2">
                <Input placeholder="Device Name (e.g., Alex's Pixel)" value={newDeviceName} onChange={(e) => setNewDeviceName(e.target.value)} />
                <Input placeholder="Owner's Name" value={newDeviceOwner} onChange={(e) => setNewDeviceOwner(e.target.value)} />
                <Button onClick={handleAddTrustedDevice}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
