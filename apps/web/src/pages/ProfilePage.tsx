import { useState } from 'react';
import { Button, Input, Textarea, Badge, Card } from '@skillgap/ui';
import { Navbar } from '../components/Navbar';

export function ProfilePage(): React.JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    title: 'Frontend Engineer',
    bio: 'Passionate about building beautiful web applications.',
    location: 'San Francisco, CA',
    skills: ['React', 'TypeScript', 'Node.js', 'CSS'],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-primary">Profile</h1>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? 'secondary' : 'primary'}
          >
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </div>

        <Card className="mt-6 p-6">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-primary" />
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary">
                      Name
                    </label>
                    <Input
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary">
                      Email
                    </label>
                    <Input
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary">
                      Title
                    </label>
                    <Input
                      value={profile.title}
                      onChange={(e) =>
                        setProfile({ ...profile, title: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary">
                      Location
                    </label>
                    <Input
                      value={profile.location}
                      onChange={(e) =>
                        setProfile({ ...profile, location: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary">
                      Bio
                    </label>
                    <Textarea
                      value={profile.bio}
                      onChange={(e) =>
                        setProfile({ ...profile, bio: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-semibold text-text-primary">
                    {profile.name}
                  </h2>
                  <p className="mt-1 text-text-secondary">{profile.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {profile.location}
                  </p>
                  <p className="mt-3 text-text-secondary">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="mt-6 p-6">
          <h3 className="text-lg font-semibold text-text-primary">Skills</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="info">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}