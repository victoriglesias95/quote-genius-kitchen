
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogFooter } from '@/components/ui/dialog';
import { getUniqueCategories, getAvailableUnits, addProductToDatabase } from '@/data/productDatabase';
import { toast } from 'sonner';

// Define the form schema for new product
const productFormSchema = z.object({
  name: z.string().min(2, { message: "Product name must be at least 2 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  units: z.array(z.string()).min(1, { message: "Please select at least one unit." }),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

interface AddProductFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onSuccess, onClose }) => {
  const categories = React.useMemo(() => getUniqueCategories(), []);
  const availableUnits = React.useMemo(() => getAvailableUnits(), []);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "",
      units: [],
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    addProductToDatabase(data.name, data.category, data.units);
    
    toast({
      title: "Product Added",
      description: `${data.name} has been added to the product database.`,
    });
    
    form.reset(); // Reset form fields
    onSuccess(); // Notify parent component
    onClose(); // Close dialog
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="units"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Units</FormLabel>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableUnits.map((unit) => (
                  <FormField
                    key={unit}
                    control={form.control}
                    name="units"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={unit}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(unit)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, unit])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== unit
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {unit}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit">Add Product</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default AddProductForm;
