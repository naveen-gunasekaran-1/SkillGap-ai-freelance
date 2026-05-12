import { useState } from 'react';
import { Button, Input, Textarea, Badge, Card, Avatar, MatchScore, ProgressBar } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

const profileTabs = ['Overview', 'Skills', 'Experience', 'Settings'] as const;
type ProfileTab = typeof profileTabs[number];
const allSkills = ['React', 'TypeScript', 'Node.js', 'CSS', 'Next.js', 'Python', 'AWS', 'Docker', 'GraphQL', 'SQL', 'Git', 'Figma', 'Tailwind CSS', 'MongoDB'];

/**
 * Candidate profile page with avatar, tabs, editable skills, experience timeline, and settings.
 */
export function ProfilePage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<ProfileTab>('Overview');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({ name: 'John Doe', email: 'john@example.com', title: 'Frontend Engineer', bio: 'Passionate about building beautiful web applications with React and TypeScript. Looking for opportunities to grow in full-stack development.', location: 'San Francisco, CA' });
  const [skills, setSkills] = useState(['React', 'TypeScript', 'Node.js', 'CSS']);

  const set = (key: string, val: string) => setProfile((p) => ({ ...p, [key]: val }));
  const toggleSkill = (s: string) => setSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const completionPercent = Math.min(100, Math.round(((profile.name ? 1 : 0) + (profile.email ? 1 : 0) + (profile.title ? 1 : 0) + (profile.bio ? 1 : 0) + (skills.length > 0 ? 1 : 0)) / 5 * 100));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-8 md:py-12">
        {/* Profile header */}
        <Card className="overflow-hidden animate-fade-in-up">
          <div className="h-28 bg-gradient-to-r from-primary via-ai-purple to-ai-cyan" />
          <div className="px-6 pb-6 md:px-8 md:pb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between -mt-10">
              <div className="flex items-end gap-4">
                <div className="relative">
                  <Avatar name={profile.name} size="lg" className="h-20 w-20 text-xl ring-4 ring-white shadow-card" />
                  <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-card hover:bg-primary-dark transition-colors" aria-label="Change avatar">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" /></svg>
                  </button>
                </div>
                <div className="mb-1">
                  <h1 className="text-xl font-bold text-text-primary md:text-2xl">{profile.name}</h1>
                  <p className="text-sm text-text-secondary">{profile.title} • {profile.location}</p>
                </div>
              </div>
              <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? 'secondary' : 'primary'} size="sm">
                {isEditing ? 'Save Profile' : 'Edit Profile'}
              </Button>
            </div>
            {/* Profile completion */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1"><ProgressBar value={completionPercent} showPercent={false} /></div>
              <span className="text-sm font-medium text-text-secondary">{completionPercent}% complete</span>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="mt-6 border-b border-border animate-fade-in-up delay-100">
          <div className="flex gap-1 overflow-x-auto">
            {profileTabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>{tab}</button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="mt-6 animate-fade-in-up delay-200">
          {activeTab === 'Overview' && (
            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
              <Card className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <Input label="Full name" value={profile.name} onChange={(e) => set('name', e.target.value)} />
                    <Input label="Title" value={profile.title} onChange={(e) => set('title', e.target.value)} />
                    <Input label="Location" value={profile.location} onChange={(e) => set('location', e.target.value)} />
                    <Textarea label="Bio" value={profile.bio} onChange={(e) => set('bio', e.target.value)} />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">About</h2>
                    <p className="mt-3 text-text-secondary leading-relaxed">{profile.bio}</p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {[{ label: 'Email', value: profile.email }, { label: 'Location', value: profile.location }].map((d) => (
                        <div key={d.label} className="rounded-card border border-border p-3"><p className="text-xs text-text-secondary">{d.label}</p><p className="mt-1 text-sm font-medium text-text-primary">{d.value}</p></div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
              <div className="space-y-6">
                <Card className="p-6 text-center">
                  <h3 className="text-sm font-semibold text-text-secondary">Match Score</h3>
                  <div className="mt-3 flex justify-center"><MatchScore value={78} size={80} /></div>
                  <p className="mt-2 text-xs text-text-secondary">Avg. across all jobs</p>
                </Card>
                {/* Resume upload */}
                <Card className="p-6">
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Resume</h3>
                  <div className="rounded-card border-2 border-dashed border-border p-6 text-center">
                    <span className="text-2xl">📄</span>
                    <p className="mt-2 text-xs text-text-secondary">Drop file or click to upload</p>
                    <Button variant="ghost" size="sm" className="mt-2">Upload</Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'Skills' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">Your Skills</h2>
                <Badge variant="info">{skills.length} skills</Badge>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {skills.map((s) => (
                  <button key={s} onClick={() => toggleSkill(s)} className="inline-flex items-center gap-1.5 rounded-full bg-primary text-white px-3.5 py-1.5 text-sm font-medium transition-all hover:bg-primary-dark">
                    {s}
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" /></svg>
                  </button>
                ))}
              </div>
              <h3 className="text-sm font-medium text-text-secondary mb-3">Add more skills</h3>
              <div className="flex flex-wrap gap-2">
                {allSkills.filter((s) => !skills.includes(s)).map((s) => (
                  <button key={s} onClick={() => toggleSkill(s)} className="rounded-full bg-border/50 px-3.5 py-1.5 text-sm font-medium text-text-secondary hover:bg-primary-light hover:text-primary transition-all">+ {s}</button>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'Experience' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-6">Experience</h2>
              <div className="relative">
                {[{ title: 'Frontend Developer', company: 'TechStartup', period: 'Jan 2024 - Present', desc: 'Building React applications with TypeScript.' }, { title: 'Junior Developer', company: 'WebAgency', period: 'Jun 2022 - Dec 2023', desc: 'Developed client websites using React and CSS.' }].map((exp, i) => (
                  <div key={exp.title} className="relative flex gap-4 pb-8 last:pb-0">
                    {i < 1 && <div className="absolute left-[11px] top-6 h-full w-0.5 bg-border" />}
                    <div className="relative z-10 mt-1 h-6 w-6 rounded-full border-2 border-primary bg-primary-light flex-shrink-0" />
                    <div><p className="font-semibold text-text-primary">{exp.title}</p><p className="text-sm text-primary font-medium">{exp.company}</p><p className="text-xs text-text-secondary">{exp.period}</p><p className="mt-2 text-sm text-text-secondary">{exp.desc}</p></div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'Settings' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-6">Account Settings</h2>
              <div className="space-y-4 max-w-md">
                <Input label="Email" value={profile.email} onChange={(e) => set('email', e.target.value)} />
                <Input label="Password" type="password" value="••••••••" readOnly />
                <Button variant="secondary" size="sm">Change password</Button>
                <div className="border-t border-border pt-6 mt-6">
                  <Button variant="danger" size="sm">Delete account</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}