
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BatchCallFormData } from '@/types/batchCall';

interface BatchCallFormProps {
  formData: BatchCallFormData;
  setFormData: React.Dispatch<React.SetStateAction<BatchCallFormData>>;
  onSubmit: () => void;
  isLoading: boolean;
}

const BatchCallForm: React.FC<BatchCallFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  isLoading
}) => {
  const updatePrompt = (index: number, value: string) => {
    const newPrompts = [...formData.interviewPrompts];
    newPrompts[index] = value;
    setFormData({ ...formData, interviewPrompts: newPrompts });
  };

  const addPrompt = () => {
    setFormData({
      ...formData,
      interviewPrompts: [...formData.interviewPrompts, ''],
    });
  };

  const removePrompt = (index: number) => {
    const newPrompts = formData.interviewPrompts.filter((_, i) => i !== index);
    setFormData({ ...formData, interviewPrompts: newPrompts });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ElevenLabs Batch Call Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="candidateId">Candidate ID</Label>
            <Input
              id="candidateId"
              value={formData.candidateId}
              onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
              placeholder="Enter candidate ID"
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+1234567890"
            />
          </div>
        </div>

        <div>
          <Label>Interview Prompts</Label>
          {formData.interviewPrompts.map((prompt, index) => (
            <div key={index} className="flex gap-2 mt-2">
              <Textarea
                value={prompt}
                onChange={(e) => updatePrompt(index, e.target.value)}
                placeholder={`Interview prompt ${index + 1}`}
                className="flex-1"
              />
              {formData.interviewPrompts.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removePrompt(index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPrompt}
            className="mt-2"
          >
            Add Prompt
          </Button>
        </div>

        <Button onClick={onSubmit} disabled={isLoading} className="w-full">
          {isLoading ? 'Starting Batch Call...' : 'Start Batch Call'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BatchCallForm;
