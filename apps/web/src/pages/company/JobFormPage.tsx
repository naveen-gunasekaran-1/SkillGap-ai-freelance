import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button, Card, Input, Badge } from '@skillgap/ui';
import { ArrowLeft, Plus, X, Sparkles, Save, Trash2 } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { api } from '../../lib/api';
import { parseJob } from '../../lib/normalize';

type JobType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';

const jobTypes: { value: JobType; label: string }[] = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

export function JobFormPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const isEdit = Boolean(jobId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<JobType>('FULL_TIME');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  // Fetch existing job for edit mode
  const jobQuery = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const res = await api.get(`/jobs/${jobId}`);
      return parseJob(res.data);
    },
    enabled: isEdit,
  });

  // Populate form when editing
  useEffect(() => {
    if (jobQuery.data) {
      const job = jobQuery.data;
      setTitle(job.title);
      setDescription(job.description);
      setLocation(job.location);
      setType(job.type);
      setSalaryMin(job.salaryMin?.toString() ?? '');
      setSalaryMax(job.salaryMax?.toString() ?? '');
      setRequirements(job.requirements.length > 0 ? job.requirements : ['']);
      setSkills(job.skillsRequired.map((s) => s.name));
    }
  }, [jobQuery.data]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        description,
        location,
        type,
        salaryMin: salaryMin ? parseInt(salaryMin, 10) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax, 10) : undefined,
        requirements: requirements.filter((r) => r.trim()),
        skillNames: skills,
      };
      if (isEdit) {
        return api.put(`/jobs/${jobId}`, payload);
      }
      return api.post('/jobs', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success(isEdit ? 'Job updated!' : 'Job posted!');
      navigate('/company/jobs');
    },
    onError: () => {
      toast.error('Failed to save job');
    },
  });

  const addRequirement = () => setRequirements([...requirements, '']);
  const updateRequirement = (idx: number, val: string) => {
    const updated = [...requirements];
    updated[idx] = val;
    setRequirements(updated);
  };
  const removeRequirement = (idx: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== idx));
    }
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };
  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate();
  };

  if (isEdit && jobQuery.isLoading) {
    return (
      <AppShell>
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-border" />
            <div className="h-64 rounded-card bg-border/60" />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="animate-fade-in-up">
          <button
            type="button"
            onClick={() => navigate('/company/jobs')}
            className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </button>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
            {isEdit ? 'Edit Job Posting' : 'Create New Job'}
          </h1>
          <p className="mt-2 text-text-secondary">
            {isEdit
              ? 'Update job details and requirements'
              : 'Fill in the details to post a new job opening'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 animate-fade-in-up delay-100">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-6">Basic Information</h2>
            <div className="space-y-5">
              <div>
                <label
                  className="block text-sm font-medium text-text-primary mb-1.5"
                  htmlFor="title"
                >
                  Job Title <span className="text-error">*</span>
                </label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-text-primary mb-1.5"
                  htmlFor="description"
                >
                  Job Description <span className="text-error">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                  className="min-h-[160px] w-full rounded-card border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-light"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    className="block text-sm font-medium text-text-primary mb-1.5"
                    htmlFor="location"
                  >
                    Location <span className="text-error">*</span>
                  </label>
                  <Input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Remote, San Francisco, CA"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-text-primary mb-1.5"
                    htmlFor="type"
                  >
                    Employment Type
                  </label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value as JobType)}
                    className="w-full rounded-card border border-border bg-white px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-light"
                  >
                    {jobTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    className="block text-sm font-medium text-text-primary mb-1.5"
                    htmlFor="salaryMin"
                  >
                    Minimum Salary (USD)
                  </label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="e.g. 80000"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-text-primary mb-1.5"
                    htmlFor="salaryMax"
                  >
                    Maximum Salary (USD)
                  </label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="e.g. 120000"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Requirements */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-6">Requirements</h2>
            <div className="space-y-3">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={req}
                    onChange={(e) => updateRequirement(idx, e.target.value)}
                    placeholder={`Requirement ${idx + 1}`}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeRequirement(idx)}
                    className="p-2 text-text-secondary hover:text-error transition-colors"
                    aria-label="Remove requirement"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={addRequirement}>
                <Plus className="h-4 w-4 mr-1" />
                Add Requirement
              </Button>
            </div>
          </Card>

          {/* Skills */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-semibold text-text-primary">Required Skills</h2>
              <Badge variant="ai">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Matched
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1.5 text-sm font-medium text-primary"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-primary-dark"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Type a skill and press Enter"
                className="flex-1"
              />
              <Button type="button" variant="secondary" onClick={addSkill}>
                Add
              </Button>
            </div>
            <p className="mt-3 text-xs text-text-secondary">
              Skills are used by our AI to match candidates. Be specific for better results.
            </p>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => navigate('/company/jobs')}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              <Save className="h-4 w-4 mr-1" />
              {createMutation.isPending ? 'Saving...' : isEdit ? 'Update Job' : 'Post Job'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
