import React, { useState } from 'react';
import { User, Shield, Cpu, Sun, Trash2, Check, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || 'Alex Rivera');
  const [email, setEmail] = useState(user?.email || 'alex.rivera@techcorp.io');
  const [role, setRole] = useState(user?.role || 'Lead Frontend Engineer');
  const [selectedModel, setSelectedModel] = useState('rootcause-v3.5');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email, role });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">
          Account & Platform Settings
        </h1>
        <p className="text-xs text-[#6B7280] mt-1">
          Manage your profile, security, AI models, and workspace options.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-2xl border border-emerald-200 flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 text-emerald-600" /> Settings updated successfully!
        </div>
      )}

      {/* Card 1: Profile Details */}
      <Card padded className="space-y-6">
        <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-4">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#111827]">Profile Settings</h3>
            <p className="text-xs text-[#6B7280]">
              Update your personal information and organization title.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Engineering Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <Input
              label="Organization"
              value={user?.organization || 'Acme Systems Inc.'}
              disabled
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Card 2: AI Model Selection Engine */}
      <Card padded className="space-y-6">
        <div className="flex items-center gap-3 border-b border-[#E5E7EB] pb-4">
          <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#111827]">AI Analysis Engine</h3>
            <p className="text-xs text-[#6B7280]">
              Select the default model for stack trace parsing and root cause generation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              id: 'rootcause-v3.5',
              name: 'RootCause-v3.5',
              desc: 'Optimized for AST stack trace & code diff accuracy.',
              badge: 'Recommended',
            },
            {
              id: 'claude-3.5',
              name: 'Claude 3.5 Sonnet',
              desc: 'High capability reasoning for complex memory leaks.',
              badge: 'Pro',
            },
            {
              id: 'gpt-4o',
              name: 'GPT-4o Omnispace',
              desc: 'Fast parallel analysis for large log dumps.',
              badge: 'Fast',
            },
          ].map((model) => (
            <div
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 relative select-none ${
                selectedModel === model.id
                  ? 'bg-blue-50/50 border-blue-600 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#111827]">{model.name}</h4>
                <Badge size="sm" variant={selectedModel === model.id ? 'primary' : 'default'}>
                  {model.badge}
                </Badge>
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed">{model.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Card 3: Theme Preferences */}
      <Card padded className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827]">Appearance & Theme</h3>
              <p className="text-xs text-[#6B7280]">
                Light theme design system active (#F8FAFC canvas background).
              </p>
            </div>
          </div>
          <Badge variant="success">Strict Light Theme</Badge>
        </div>
      </Card>

      {/* Card 4: Danger Zone */}
      <Card padded className="space-y-4 border-red-200 bg-red-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-100 text-red-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900">Danger Zone</h3>
              <p className="text-xs text-red-700">
                Permanently delete your account and all stored bug analysis history.
              </p>
            </div>
          </div>
          <Button variant="danger" size="sm" leftIcon={<Trash2 className="w-4 h-4" />}>
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
};
