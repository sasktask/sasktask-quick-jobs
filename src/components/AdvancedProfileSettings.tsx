import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X, Plus, DollarSign, Clock, Briefcase } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdvancedProfileSettingsProps {
  profile: any;
  onUpdate: () => void;
}

const CATEGORIES = [
  "Snow Removal",
  "Cleaning",
  "Moving",
  "Delivery",
  "Handyman",
  "Gardening",
  "Pet Care",
  "Other"
];

export const AdvancedProfileSettings = ({ profile, onUpdate }: AdvancedProfileSettingsProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [preferredCategories, setPreferredCategories] = useState<string[]>(profile?.preferred_categories || []);
  const [experienceYears, setExperienceYears] = useState(profile?.experience_years || 0);
  const [hourlyRate, setHourlyRate] = useState(profile?.hourly_rate || "");
  const [availabilityStatus, setAvailabilityStatus] = useState(profile?.availability_status || "available");

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const toggleCategory = (category: string) => {
    if (preferredCategories.includes(category)) {
      setPreferredCategories(preferredCategories.filter(c => c !== category));
    } else {
      setPreferredCategories([...preferredCategories, category]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          skills,
          preferred_categories: preferredCategories,
          experience_years: experienceYears,
          hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
          availability_status: availabilityStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Settings Saved!",
        description: "Your advanced profile settings have been updated.",
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Advanced Settings</CardTitle>
        <CardDescription>Manage your professional profile and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Skills */}
        <div className="space-y-3">
          <Label>Your Skills</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill (e.g., Plumbing, Carpentry)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="gap-1">
                {skill}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => removeSkill(skill)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="space-y-2">
          <Label htmlFor="experience">Years of Experience</Label>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <Input
              id="experience"
              type="number"
              min="0"
              value={experienceYears}
              onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>

        {/* Hourly Rate */}
        <div className="space-y-2">
          <Label htmlFor="rate">Hourly Rate (Optional)</Label>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <Input
              id="rate"
              type="number"
              step="0.01"
              min="0"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="25.00"
            />
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-2">
          <Label htmlFor="availability">Availability Status</Label>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
              <SelectTrigger id="availability">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available Now</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preferred Categories */}
        <div className="space-y-3">
          <Label>Preferred Task Categories</Label>
          <p className="text-sm text-muted-foreground">
            Select categories you want to see recommended jobs for
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                type="button"
                variant={preferredCategories.includes(category) ? "default" : "outline"}
                onClick={() => toggleCategory(category)}
                className="justify-start"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save Advanced Settings"}
        </Button>
      </CardContent>
    </Card>
  );
};
