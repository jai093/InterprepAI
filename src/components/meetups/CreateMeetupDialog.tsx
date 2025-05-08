
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Clock, MapPin, Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMeetups } from "@/hooks/useMeetups";

interface CreateMeetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateMeetupDialog = ({ open, onOpenChange }: CreateMeetupDialogProps) => {
  const { createMeetup } = useMeetups();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("50");
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTag = () => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const success = await createMeetup({
      title,
      description,
      host: "You", // In a real app, this would come from the authenticated user
      hostTitle: "InterviewPrep User", // In a real app, this would come from user profile
      avatar: "",
      date,
      time,
      location,
      attendees: 1, // Starting with the creator
      capacity: parseInt(capacity),
      tags
    });
    
    if (success) {
      resetForm();
      onOpenChange(false);
    }
    
    setIsSubmitting(false);
  };
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setLocation("");
    setCapacity("50");
    setTags([]);
    setTag("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Meetup</DialogTitle>
          <DialogDescription>
            Share your knowledge and connect with others by hosting a meetup.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meetup Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g., Technical Interview Strategies" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Describe what participants will learn and experience" 
              required 
              rows={3} 
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" /> 
                Date
              </Label>
              <Input 
                id="date" 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center">
                <Clock className="w-4 h-4 mr-2" /> 
                Time
              </Label>
              <Input 
                id="time" 
                placeholder="e.g., 6:00 PM - 8:00 PM" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                required 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" /> 
                Location
              </Label>
              <Input 
                id="location" 
                placeholder="e.g., Virtual or San Francisco, CA" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input 
                id="capacity" 
                type="number" 
                min="1" 
                max="500" 
                value={capacity} 
                onChange={(e) => setCapacity(e.target.value)} 
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags" className="flex items-center">
              <Tag className="w-4 h-4 mr-2" /> 
              Tags (Press Enter to add)
            </Label>
            <div className="flex">
              <Input 
                id="tags" 
                placeholder="e.g., Technical, Coding, Career" 
                value={tag} 
                onChange={(e) => setTag(e.target.value)} 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button 
                type="button" 
                variant="secondary" 
                onClick={addTag} 
                className="ml-2"
              >
                Add
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((t, i) => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-1">
                    {t}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeTag(t)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Meetup"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMeetupDialog;
