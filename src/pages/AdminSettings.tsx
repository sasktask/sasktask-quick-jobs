import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEOHead } from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Bell,
  Shield,
  CreditCard,
  Mail,
  Globe,
  Save,
} from "lucide-react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    // General
    platformName: "SaskTask",
    platformDescription: "Find local help for any task",
    maintenanceMode: false,
    
    // Payments
    platformFeePercent: 10,
    minimumTaskAmount: 20,
    maximumTaskAmount: 10000,
    escrowEnabled: true,
    
    // Notifications
    emailNotificationsEnabled: true,
    pushNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    
    // Security
    requireEmailVerification: true,
    require2FA: false,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    
    // Email Templates
    welcomeEmailSubject: "Welcome to SaskTask!",
    welcomeEmailBody: "Thank you for joining SaskTask...",
  });

  const handleSaveSettings = () => {
    // In a real app, this would save to database
    toast.success("Settings saved successfully");
  };

  return (
    <>
      <SEOHead title="Platform Settings - Admin" description="Manage platform settings" />
      <AdminLayout title="Platform Settings" description="Configure platform-wide settings">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic platform settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="platformName">Platform Name</Label>
                    <Input
                      id="platformName"
                      value={settings.platformName}
                      onChange={(e) =>
                        setSettings({ ...settings, platformName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platformDescription">Platform Description</Label>
                    <Input
                      id="platformDescription"
                      value={settings.platformDescription}
                      onChange={(e) =>
                        setSettings({ ...settings, platformDescription: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="maintenanceMode" className="font-medium">
                      Maintenance Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable to show maintenance page to all users
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, maintenanceMode: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>
                  Configure payment and transaction settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="platformFee">Platform Fee (%)</Label>
                    <Input
                      id="platformFee"
                      type="number"
                      value={settings.platformFeePercent}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          platformFeePercent: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minAmount">Minimum Task Amount ($)</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      value={settings.minimumTaskAmount}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          minimumTaskAmount: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAmount">Maximum Task Amount ($)</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      value={settings.maximumTaskAmount}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maximumTaskAmount: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="escrowEnabled" className="font-medium">
                      Escrow Payments
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Hold payments in escrow until task completion
                    </p>
                  </div>
                  <Switch
                    id="escrowEnabled"
                    checked={settings.escrowEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, escrowEnabled: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications to users
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotificationsEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, emailNotificationsEnabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send push notifications to users
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotificationsEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, pushNotificationsEnabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send SMS notifications to users (additional cost)
                    </p>
                  </div>
                  <Switch
                    checked={settings.smsNotificationsEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, smsNotificationsEnabled: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Users must verify their email before accessing features
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, requireEmailVerification: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">Require 2FA</Label>
                    <p className="text-sm text-muted-foreground">
                      Require two-factor authentication for all users
                    </p>
                  </div>
                  <Switch
                    checked={settings.require2FA}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, require2FA: checked })
                    }
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maxLoginAttempts: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          sessionTimeout: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Templates */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>
                  Customize email templates sent to users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="welcomeSubject">Welcome Email Subject</Label>
                  <Input
                    id="welcomeSubject"
                    value={settings.welcomeEmailSubject}
                    onChange={(e) =>
                      setSettings({ ...settings, welcomeEmailSubject: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="welcomeBody">Welcome Email Body</Label>
                  <Textarea
                    id="welcomeBody"
                    value={settings.welcomeEmailBody}
                    onChange={(e) =>
                      setSettings({ ...settings, welcomeEmailBody: e.target.value })
                    }
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSaveSettings} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save All Settings
          </Button>
        </div>
      </AdminLayout>
    </>
  );
}
