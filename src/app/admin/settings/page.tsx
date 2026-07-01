'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import type { User, SchoolSettings } from '@/types/database';
import { formatCurrency } from '@/lib/utils';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [finePerDay, setFinePerDay] = useState('20');
  const [defaultLoanDays, setDefaultLoanDays] = useState('14');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser(profile);

        const { data: existing } = await supabase
          .from('school_settings')
          .select('*')
          .eq('school_id', profile.school_id)
          .single();

        if (existing) {
          setSettings(existing);
          setFinePerDay(existing.fine_per_day.toString());
          setDefaultLoanDays(existing.default_loan_days.toString());
        } else {
          const { data: school } = await supabase
            .from('schools')
            .select('fine_per_day, default_loan_days')
            .eq('id', profile.school_id)
            .single();

          if (school) {
            setFinePerDay(school.fine_per_day.toString());
            setDefaultLoanDays(school.default_loan_days.toString());
          }
        }
      }
    }
    load();
  }, [supabase]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);

    const fineValue = parseFloat(finePerDay) || 20;
    const loanValue = parseInt(defaultLoanDays) || 14;

    if (settings) {
      await supabase
        .from('school_settings')
        .update({
          fine_per_day: fineValue,
          default_loan_days: loanValue,
          updated_by: user.id,
        })
        .eq('id', settings.id);
    } else {
      await supabase.from('school_settings').insert({
        school_id: user.school_id,
        fine_per_day: fineValue,
        default_loan_days: loanValue,
        updated_by: user.id,
      });
    }

    // Also update the school record
    await supabase
      .from('schools')
      .update({
        fine_per_day: fineValue,
        default_loan_days: loanValue,
      })
      .eq('id', user.school_id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#E8E8ED]">School Settings</h1>
          <p className="mt-1 text-sm text-[#6B6B7B]">Configure lending rules and fine rates</p>
        </div>

        <div className="rounded-xl border border-[#1E1E28] bg-[#0F0F14] p-6 space-y-6">
          <h2 className="font-heading text-base font-semibold text-[#E8E8ED]">Lending Rules</h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fine_per_day">Fine Per Day (KES)</Label>
              <Input
                id="fine_per_day"
                type="number"
                step="0.5"
                min="0"
                value={finePerDay}
                onChange={(e) => setFinePerDay(e.target.value)}
              />
              <p className="text-xs text-[#6B6B7B]">
                Charged for each day a book is returned late
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_loan_days">Default Loan Period (Days)</Label>
              <Input
                id="default_loan_days"
                type="number"
                min="1"
                value={defaultLoanDays}
                onChange={(e) => setDefaultLoanDays(e.target.value)}
              />
              <p className="text-xs text-[#6B6B7B]">
                Standard number of days for a book loan
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-[#1E1E28] bg-[#0B0B0F] p-4">
            <p className="text-sm text-[#9D9DA8]">
              Preview: <strong className="text-[#E8E8ED]">{formatCurrency(parseFloat(finePerDay) || 0)}/day</strong> fine,{' '}
              <strong className="text-[#E8E8ED]">{defaultLoanDays}-day</strong> default loan period
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                'Saving...'
              ) : saved ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
