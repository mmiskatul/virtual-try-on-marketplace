'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Check, MapPin, Plus, Trash2 } from 'lucide-react';
import { useMarketplaceStore } from '../../../stores/useMarketplaceStore';
import { AccountLayoutShell } from '../../../components/account/AccountSidebar';
import { Button } from '../../../components/ui/button';

export default function AccountProfilePage() {
  const { data: session } = useSession();
  const addresses = useMarketplaceStore((s) => s.addresses);
  const addAddress = useMarketplaceStore((s) => s.addAddress);
  const removeAddress = useMarketplaceStore((s) => s.removeAddress);
  const setDefaultAddress = useMarketplaceStore((s) => s.setDefaultAddress);

  const [phone, setPhone] = useState('+880 1711-000000');
  const [savedNotice, setSavedNotice] = useState(false);

  // New Address state
  const [label, setLabel] = useState('Office');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Bangladesh');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim() || !city.trim()) return;
    addAddress({
      label: label.trim() || 'Saved Address',
      fullName: session?.user?.name || 'Customer',
      email: session?.user?.email || 'customer@example.com',
      phone,
      street: street.trim(),
      city: city.trim(),
      state: city.trim(),
      postalCode: postalCode.trim() || '1200',
      country: country.trim() || 'Bangladesh',
      isDefault: false,
    });
    setStreet('');
    setPostalCode('');
  };

  return (
    <AccountLayoutShell
      title="Personal Profile & Address Book"
      subtitle="Update your contact preferences and saved shipping destinations."
    >
      <form onSubmit={handleSaveProfile} className="rounded-3xl border border-stone-200 bg-white p-6 space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-950">Personal Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-stone-600 mb-1">Full Name</label>
            <input
              type="text"
              defaultValue={session?.user?.name || 'Customer'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50"
            />
          </div>
          <div>
            <label className="block font-bold text-stone-600 mb-1">Email Address</label>
            <input
              type="email"
              readOnly
              value={session?.user?.email || 'verified@example.com'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-500"
            />
          </div>
          <div>
            <label className="block font-bold text-stone-600 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm">Save Profile</Button>
          {savedNotice && (
            <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1">
              <Check className="w-4 h-4" /> Profile updated
            </span>
          )}
        </div>
      </form>

      {/* Address Book */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 space-y-5">
        <h2 className="font-serif text-lg font-bold text-stone-950">Saved Delivery Addresses</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-stone-950">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {addr.label}
                </span>
                {addr.isDefault && (
                  <span className="px-2 py-0.5 rounded-full bg-stone-950 text-white text-[10px]">Default</span>
                )}
              </div>
              <p className="text-stone-700">{addr.street}</p>
              <p className="text-stone-500">{addr.city}, {addr.country} {addr.postalCode}</p>
              <div className="flex gap-3 pt-1">
                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => setDefaultAddress(addr.id)}
                    className="font-bold text-stone-900 underline"
                  >
                    Set Default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAddress(addr.id)}
                  className="text-rose-600 inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddAddress} className="border-t border-stone-100 pt-5 space-y-3 text-xs">
          <p className="font-bold uppercase tracking-wider text-stone-500">Add New Address</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (Home, Office)"
              className="px-3 py-2 rounded-xl border border-stone-200"
            />
            <input
              type="text"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Street Address *"
              className="px-3 py-2 rounded-xl border border-stone-200"
            />
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City *"
              className="px-3 py-2 rounded-xl border border-stone-200"
            />
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Postal Code"
              className="px-3 py-2 rounded-xl border border-stone-200"
            />
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country"
              className="px-3 py-2 rounded-xl border border-stone-200"
            />
          </div>
          <Button type="submit" size="sm" variant="outline" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Address
          </Button>
        </form>
      </div>
    </AccountLayoutShell>
  );
}

