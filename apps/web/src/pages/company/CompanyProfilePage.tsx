import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Card, Button, Input, Textarea, Badge, Avatar } from '@skillgap/ui';
import {
  Building2,
  Globe,
  Users,
  MapPin,
  Mail,
  Phone,
  Edit3,
  Save,
  CheckCircle,
  Upload,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { useAuthStore } from '../../stores/authStore';

interface CompanyFormData {
  name: string;
  industry: string;
  size: string;
  website: string;
  description: string;
  location: string;
  email: string;
  phone: string;
}

/**
 * Company profile page with editable company information.
 */
export function CompanyProfilePage(): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);

  // Mock company data
  const company = {
    id: '1',
    name: 'Acme Corporation',
    logo: null,
    isVerified: true,
    verificationBadge: 'MCA' as const,
    industry: 'Technology',
    size: '51-200 employees',
    website: 'https://acme.example.com',
    description: 'Acme Corporation is a leading technology company focused on building innovative solutions for businesses worldwide. We specialize in AI-powered tools and enterprise software.',
    location: 'San Francisco, CA',
    email: 'careers@acme.example.com',
    phone: '+1 (555) 123-4567',
    founded: '2015',
    openJobs: 5,
  };

  const { register, handleSubmit, formState: { isDirty } } = useForm<CompanyFormData>({
    defaultValues: {
      name: company.name,
      industry: company.industry,
      size: company.size,
      website: company.website,
      description: company.description,
      location: company.location,
      email: company.email,
      phone: company.phone,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast.success('Company profile updated');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const onSubmit = (data: CompanyFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">Company Profile</h1>
          <p className="mt-2 text-text-secondary">Manage your company information and branding</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main Column */}
          <div className="space-y-6">
            {/* Company Info Card */}
            <Card className="overflow-hidden animate-fade-in-up delay-100">
              <div className="flex items-center justify-between border-b border-border p-5">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-text-secondary" />
                  <h2 className="font-semibold text-text-primary">Company Information</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>Cancel</>
                  ) : (
                    <><Edit3 className="h-4 w-4 mr-1" /> Edit</>
                  )}
                </Button>
              </div>
              <div className="p-5">
                {isEditing ? (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input label="Company Name" {...register('name')} />
                      <Input label="Industry" {...register('industry')} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input label="Company Size" {...register('size')} />
                      <Input label="Location" {...register('location')} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input label="Website" {...register('website')} type="url" />
                      <Input label="Careers Email" {...register('email')} type="email" />
                    </div>
                    <Input label="Phone" {...register('phone')} type="tel" />
                    <Textarea 
                      label="Company Description" 
                      {...register('description')} 
                      rows={4} 
                      placeholder="Tell candidates about your company culture, mission, and values..."
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
                        <Save className="h-4 w-4 mr-1" />
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* Company Header */}
                    <div className="flex items-center gap-4">
                      <Avatar name={company.name} size="xl" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold text-text-primary">{company.name}</h3>
                          {company.isVerified && (
                            <Badge variant="success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-text-secondary">{company.industry}</p>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-border">
                      <InfoRow icon={<Users className="h-4 w-4" />} label="Size" value={company.size} />
                      <InfoRow icon={<MapPin className="h-4 w-4" />} label="Location" value={company.location} />
                      <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={company.email} />
                      <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={company.phone} />
                      <InfoRow 
                        icon={<Globe className="h-4 w-4" />} 
                        label="Website" 
                        value={
                          <a 
                            href={company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {company.website}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        } 
                      />
                    </div>

                    {/* Description */}
                    <div className="pt-4 border-t border-border">
                      <h4 className="text-sm font-medium text-text-primary mb-2">About the Company</h4>
                      <p className="text-sm text-text-secondary leading-relaxed">{company.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Logo Upload */}
            <Card className="p-5 animate-fade-in-up delay-200">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="h-5 w-5 text-text-secondary" />
                <h2 className="font-semibold text-text-primary">Company Logo</h2>
              </div>
              <div className="flex items-center gap-4">
                <Avatar name={company.name} size="xl" />
                <div className="flex-1">
                  <p className="text-sm text-text-secondary mb-3">
                    Upload a logo to make your company more recognizable to candidates.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">
                      <Upload className="h-4 w-4 mr-1" />
                      Upload Logo
                    </Button>
                    <Button variant="ghost" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Verification Status */}
            <Card className="p-5 animate-fade-in-up delay-200">
              <h2 className="font-semibold text-text-primary mb-4">Verification Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Company</span>
                  <Badge variant="success">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Verification Type</span>
                  <Badge variant="neutral">{company.verificationBadge}</Badge>
                </div>
              </div>
              <p className="mt-4 text-xs text-text-secondary">
                Verified companies get priority placement and a trust badge on all job listings.
              </p>
            </Card>

            {/* Quick Stats */}
            <Card className="p-5 animate-fade-in-up delay-300">
              <h2 className="font-semibold text-text-primary mb-4">Company Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Open Positions</span>
                  <span className="text-sm font-semibold text-text-primary">{company.openJobs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Founded</span>
                  <span className="text-sm font-semibold text-text-primary">{company.founded}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Industry</span>
                  <span className="text-sm font-semibold text-text-primary">{company.industry}</span>
                </div>
              </div>
            </Card>

            {/* Social Links */}
            <Card className="p-5 animate-fade-in-up delay-400">
              <div className="flex items-center gap-3 mb-4">
                <LinkIcon className="h-5 w-5 text-text-secondary" />
                <h2 className="font-semibold text-text-primary">Social Links</h2>
              </div>
              <p className="text-sm text-text-secondary mb-3">
                Add your company social media profiles.
              </p>
              <Button variant="ghost" size="sm" className="w-full">
                Add Social Link
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-text-secondary mt-0.5">{icon}</span>
      <div>
        <span className="text-text-secondary">{label}:</span>
        <span className="ml-1 font-medium text-text-primary">{value}</span>
      </div>
    </div>
  );
}
