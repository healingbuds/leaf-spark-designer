import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Schemas for each section
const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
});

const contactSchema = z.object({
  phone: z.string().min(6, "Phone number is required"),
  countryCode: z.string().min(2, "Country is required"),
});

const addressSchema = z.object({
  address1: z.string().min(5, "Address is required").max(200),
  address2: z.string().max(200).optional(),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State/Region is required").max(100),
  postalCode: z.string().min(3, "Postal code is required").max(20),
  country: z.string().min(2, "Country is required").max(100),
});

type ProfileData = z.infer<typeof profileSchema>;
type ContactData = z.infer<typeof contactSchema>;
type AddressData = z.infer<typeof addressSchema>;

interface ProfileEditFormProps {
  section: 'profile' | 'contact' | 'address';
  initialData: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

const COUNTRIES = [
  { code: 'PT', name: 'Portugal' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'TH', name: 'Thailand' },
  { code: 'US', name: 'United States' },
];

export function ProfileEditForm({ section, initialData, onSave, onCancel }: ProfileEditFormProps) {
  const [saving, setSaving] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: initialData.fullName || '',
    },
  });

  // Contact form
  const contactForm = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phone: initialData.phone || '',
      countryCode: initialData.countryCode || 'ZA',
    },
  });

  // Address form
  const addressForm = useForm<AddressData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address1: initialData.address1 || '',
      address2: initialData.address2 || '',
      city: initialData.city || '',
      state: initialData.state || '',
      postalCode: initialData.postalCode || '',
      country: initialData.country || '',
    },
  });

  const handleSubmit = async (data: any) => {
    setSaving(true);
    try {
      await onSave(data);
    } finally {
      setSaving(false);
    }
  };

  // Profile Section Form
  if (section === 'profile') {
    return (
      <Form {...profileForm}>
        <form onSubmit={profileForm.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={profileForm.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  // Contact Section Form
  if (section === 'contact') {
    const selectedCountry = contactForm.watch('countryCode');
    
    return (
      <Form {...contactForm}>
        <form onSubmit={contactForm.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={contactForm.control}
            name="countryCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COUNTRIES.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={contactForm.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <PhoneInput
                    value={field.value}
                    onChange={field.onChange}
                    countryCode={selectedCountry}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  // Address Section Form
  if (section === 'address') {
    return (
      <Form {...addressForm}>
        <form onSubmit={addressForm.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={addressForm.control}
            name="address1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 1</FormLabel>
                <FormControl>
                  <Input placeholder="Street address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={addressForm.control}
            name="address2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2 (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Apartment, suite, unit, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={addressForm.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={addressForm.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Region</FormLabel>
                  <FormControl>
                    <Input placeholder="State or region" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={addressForm.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Postal code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={addressForm.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  return null;
}
