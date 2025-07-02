import { useState } from 'react';
import axios from 'axios';
import { LoaderCircle, X, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type Ticket = {
  id: number;
  title: string;
  status: string;
};

type UpdateTicketModalProps = {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ticket: Ticket | null;
};

export default function UpdateTicketModal({ show, onClose, onSuccess, ticket }: UpdateTicketModalProps) {
  const [formData, setFormData] = useState({
    message: '',
    status: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!show || !ticket) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (status: string) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    if (!formData.message.trim()) {
      setErrors({ message: 'Please provide an update message' });
      setIsSubmitting(false);
      return;
    }

    axios.post(`/api/tickets/${ticket.id}/update`, formData)
      .then(() => {
        onSuccess();
        onClose();
        setFormData({ message: '', status: '' });
      })
      .catch(error => {
        console.error('Error updating ticket:', error);
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Update Ticket Progress</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 bg-blue-50 p-3 rounded-md">
          <p className="font-medium text-gray-700">Ticket: {ticket.title}</p>
          <p className="text-sm text-gray-500">Current status: {ticket.status.replace('_', ' ')}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label>Update Status (Optional)</Label>
            <div className="flex gap-3 mb-2">
              <button
                type="button"
                className={`flex items-center px-3 py-2 rounded-md border ${formData.status === 'in_progress' ? 'bg-purple-100 border-purple-300 text-purple-800' : 'border-gray-300 hover:bg-gray-50'}`}
                onClick={() => handleStatusChange('in_progress')}
              >
                <Clock className="h-4 w-4 mr-2" />
                In Progress
              </button>
              <button
                type="button"
                className={`flex items-center px-3 py-2 rounded-md border ${formData.status === 'resolved' ? 'bg-green-100 border-green-300 text-green-800' : 'border-gray-300 hover:bg-gray-50'}`}
                onClick={() => handleStatusChange('resolved')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolved
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">Progress Update</Label>
            <textarea
              id="message"
              name="message"
              required
              value={formData.message}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Describe the progress or resolution of this ticket"
              className="w-full p-2 border rounded-md min-h-[120px]"
              rows={4}
            />
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting && <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />}
              Submit Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}