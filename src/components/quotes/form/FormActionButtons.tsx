
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';

interface FormActionButtonsProps {
  isSubmitting?: boolean;
}

export const FormActionButtons: React.FC<FormActionButtonsProps> = ({ isSubmitting }) => {
  const navigate = useNavigate();
  
  return (
    <CardFooter className="flex justify-between">
      <Button variant="outline" type="button" onClick={() => navigate('/quotes')}>
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Quote Request'}
      </Button>
    </CardFooter>
  );
};
