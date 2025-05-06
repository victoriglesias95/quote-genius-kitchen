
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getAvailableUnits, addUnitToProduct } from '@/data/productDatabase';
import { ProductDatabase } from '@/data/productDatabase';
import { toast } from 'sonner';

// Define the form schema for adding units
const unitFormSchema = z.object({
  unit: z.string().min(1, { message: "Please select a unit." }),
});

export type UnitFormValues = z.infer<typeof unitFormSchema>;

interface AddUnitFormProps {
  product: ProductDatabase;
  onSuccess: () => void;
  onClose: () => void;
}

const AddUnitForm: React.FC<AddUnitFormProps> = ({ product, onSuccess, onClose }) => {
  const availableUnits = React.useMemo(() => 
    getAvailableUnits().filter(unit => !product.units.includes(unit)), 
    [product.units]
  );
  
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      unit: "",
    },
  });

  const onSubmit = (data: UnitFormValues) => {
    const updatedProduct = addUnitToProduct(product.id, data.unit);
    
    if (updatedProduct) {
      toast({
        title: "Unit Added",
        description: `${data.unit} has been added to ${updatedProduct.name}.`,
      });
      
      form.reset(); // Reset form fields
      onSuccess(); // Notify parent component
      onClose(); // Close dialog
    }
  };

  return (
    <>
      <div className="mb-4">
        <p className="text-sm font-medium">Current Units:</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {product.units.map((unit, idx) => (
            <Badge key={`current-${idx}`} variant="outline">{unit}</Badge>
          ))}
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Unit</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableUnits.map(unit => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={availableUnits.length === 0}>
              Add Unit
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};

export default AddUnitForm;
