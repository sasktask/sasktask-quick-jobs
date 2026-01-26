import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getCategoryTitles } from "@/lib/categories";
import { FileText, Tag, MapPin, AlertCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface TaskDetailsData {
  title: string;
  category: string;
  description: string;
  location: string;
  isUrgent: boolean;
}

interface HireStepTaskDetailsProps {
  data: TaskDetailsData;
  onChange: (data: TaskDetailsData) => void;
  onNext: () => void;
  taskerSkills?: string[];
}

export const HireStepTaskDetails = ({ 
  data, 
  onChange, 
  onNext,
  taskerSkills 
}: HireStepTaskDetailsProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const categories = getCategoryTitles();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.title.trim()) {
      newErrors.title = "Task title is required";
    } else if (data.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }
    
    if (!data.category) {
      newErrors.category = "Please select a category";
    }
    
    if (!data.description.trim()) {
      newErrors.description = "Description is required";
    } else if (data.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold">What do you need help with?</h3>
        <p className="text-muted-foreground text-sm">
          Describe your task in detail so the tasker knows exactly what to expect
        </p>
      </div>

      {/* Task Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Task Title *
        </Label>
        <Input
          id="title"
          placeholder="e.g., Help me assemble IKEA furniture"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <p className="text-destructive text-xs flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.title}
          </p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          Category *
        </Label>
        <Select
          value={data.category}
          onValueChange={(value) => onChange({ ...data, category: value })}
        >
          <SelectTrigger className={errors.category ? "border-destructive" : ""}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-destructive text-xs flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.category}
          </p>
        )}
        
        {/* Suggested categories based on tasker skills */}
        {taskerSkills && taskerSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-xs text-muted-foreground">Suggested:</span>
            {taskerSkills.slice(0, 3).map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 text-xs"
                onClick={() => onChange({ ...data, category: skill })}
              >
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe what you need help with, any specific requirements, tools needed, etc."
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          rows={4}
          className={errors.description ? "border-destructive" : ""}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {errors.description ? (
            <p className="text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.description}
            </p>
          ) : (
            <span>Minimum 20 characters</span>
          )}
          <span>{data.description.length}/500</span>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location" className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Location (optional)
        </Label>
        <Input
          id="location"
          placeholder="Enter address or location"
          value={data.location}
          onChange={(e) => onChange({ ...data, location: e.target.value })}
        />
      </div>

      {/* Urgent Toggle */}
      <div 
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
          data.isUrgent 
            ? "border-orange-500 bg-orange-500/10" 
            : "border-border hover:border-primary/50"
        }`}
        onClick={() => onChange({ ...data, isUrgent: !data.isUrgent })}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">⚡ This is urgent</p>
            <p className="text-sm text-muted-foreground">
              Mark if you need this done ASAP
            </p>
          </div>
          <div className={`w-12 h-6 rounded-full transition-all ${
            data.isUrgent ? "bg-orange-500" : "bg-muted"
          }`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-all transform ${
              data.isUrgent ? "translate-x-6" : "translate-x-0.5"
            } mt-0.5`} />
          </div>
        </div>
      </div>

      {/* Next Button */}
      <Button onClick={handleNext} className="w-full gap-2" size="lg">
        Continue to Schedule
        <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};
