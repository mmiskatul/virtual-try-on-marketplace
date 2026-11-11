'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, Lock, Shield, Trash2 } from 'lucide-react';
import { useMarketplaceStore } from '../../../stores/useMarketplaceStore';
import { AccountLayoutShell } from '../../../components/account/AccountSidebar';
import { Button } from '../../../components/ui/button';

export default function AccountSettingsPage() {
  const preferences = useMarketplaceStore((s) => s.preferences);
  const updatePreferences = useMarketplaceStore((s) => s.updatePreferences);
  const savedPhotos = useMarketplaceStore((s) => s.savedPhotos);
  const clearPhotos = useMarketplaceStore((s) => s.clearAllSavedPhotos);
  const [deleteRequested, setDeleteRequested] = useState(false);

  return (
    <AccountLayoutShell
      title="Settings & Privacy Controls"
      subtitle="Manage security, notifications, and private customer photograph retention."
    >
      {/* Password Security */}
      <section className="rounded-3xl border border-stone-200 bg-white p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-serif text-lg font-bold text-stone-950 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Password Management
          </h2>
          <p className="text-xs text-stone-600">
            Update or reset your customer password securely using verified email OTP recovery.
          </p>
        </div>
        <Link href="/forgot-password">
          <Button variant="outline" size="sm">Reset Password</Button>
        </Link>
      </section>

      {/* Notification Preferences */}
      <section className="rounded-3xl border border-stone-200 bg-white p-6 space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-950 flex items-center gap-2">
          <Bell className="w-4 h-4" /> Notification Preferences
        </h2>
        <div className="space-y-3 text-xs">
          {[
            ['orderUpdates', 'Order & Shipment Updates'],
            ['brandDrops', 'Followed Brand Releases & New Collections'],
            ['tryOnAlerts', 'Virtual Try-On Completion Alerts'],
            ['promoOffers', 'Price Drops & Platform Offers'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 cursor-pointer">
              <span className="font-semibold text-stone-800">{label}</span>
              <input
                type="checkbox"
                checked={Boolean((preferences as any)[key])}
                onChange={(e) => updatePreferences({ [key]: e.target.checked })}
                className="rounded accent-stone-950"
              />
            </label>
          ))}
        </div>
      </section>

      {/* Privacy & Uploaded Photo Management */}
      <section className="rounded-3xl border border-stone-200 bg-white p-6 space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-950 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-700" /> Photo Privacy &amp; Consent
        </h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          Customer photographs remain private inside your session and are never shared across shoppers or unrelated brands.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
          <div>
            <p className="font-bold text-stone-900">Saved Photos Stored: {savedPhotos.length}</p>
            <p className="text-stone-500">Retention window: {preferences.autoDeletePhotosDays} days</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearPhotos}
            className="text-rose-600 gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete All Uploaded Photos
          </Button>
        </div>

        <label className="flex items-center gap-2 text-xs text-stone-700">
          <span>Auto-delete uploaded try-on photos after:</span>
          <select
            value={preferences.autoDeletePhotosDays}
            onChange={(e) => updatePreferences({ autoDeletePhotosDays: Number(e.target.value) })}
            className="px-2.5 py-1 rounded-lg border border-stone-300 bg-white font-semibold"
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
        </label>
      </section>

      {/* Account Deletion */}
      <section className="rounded-3xl border border-rose-200 bg-rose-50/40 p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-bold text-sm text-rose-900">Account Deletion Request</h2>
          <p className="text-xs text-rose-700">
            Permanently erase saved addresses, try-on history, and customer account credentials.
          </p>
        </div>
        {deleteRequested ? (
          <span className="text-xs font-bold text-rose-800">
            Request logged — concierge@v-try.fashion will confirm deletion via email.
          </span>
        ) : (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setDeleteRequested(true)}
          >
            Request Account Deletion
          </Button>
        )}
      </section>
    </AccountLayoutShell>
  );
}

