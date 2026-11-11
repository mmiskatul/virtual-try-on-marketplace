'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Sparkles, Tag, Trash2, Truck, Store } from 'lucide-react';
import { useMarketplaceStore } from '../../stores/useMarketplaceStore';
import { MarketplaceShell } from '../../components/layout/MarketplaceShell';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { EmptyState } from '../../components/ui/States';
import { Button } from '../../components/ui/button';

export default function NotificationsPage() {
  const notifications = useMarketplaceStore((s) => s.notifications);
  const markRead = useMarketplaceStore((s) => s.markNotificationRead);
  const markAllRead = useMarketplaceStore((s) => s.markAllNotificationsRead);
  const clearAll = useMarketplaceStore((s) => s.clearNotifications);

  const [filter, setFilter] = useState<'all' | 'unread' | 'order' | 'discount' | 'brand' | 'tryon'>('all');

  const filtered = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.read);
    if (filter === 'order') return notifications.filter((n) => n.type === 'order' || n.type === 'shipping');
    if (filter === 'discount') return notifications.filter((n) => n.type === 'discount' || n.type === 'restock');
    if (filter === 'brand') return notifications.filter((n) => n.type === 'brand' || n.type === 'collection');
    if (filter === 'tryon') return notifications.filter((n) => n.type === 'tryon');
    return notifications;
  }, [notifications, filter]);

  const iconForType = (type: string) => {
    if (type === 'order' || type === 'shipping') return <Truck className="w-4 h-4 text-emerald-700" />;
    if (type === 'discount' || type === 'restock') return <Tag className="w-4 h-4 text-rose-600" />;
    if (type === 'tryon') return <Sparkles className="w-4 h-4 text-amber-600" />;
    if (type === 'brand' || type === 'collection') return <Store className="w-4 h-4 text-stone-900" />;
    return <Bell className="w-4 h-4 text-stone-700" />;
  };

  return (
    <MarketplaceShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full space-y-6">
        <Breadcrumb items={[{ label: 'Notifications' }]} />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-950">Notifications</h1>
            <p className="text-xs text-stone-500 mt-1">
              Order alerts, shipment dispatches, followed brand drops, and try-on completions.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1.5">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll} className="gap-1.5 text-rose-600">
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </Button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            ['all', 'All'],
            ['unread', 'Unread'],
            ['order', 'Orders & Shipping'],
            ['brand', 'Brands & Collections'],
            ['discount', 'Offers'],
            ['tryon', 'Try-On'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap ${
                filter === key
                  ? 'bg-stone-950 text-white border-stone-950'
                  : 'bg-white text-stone-700 border-stone-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-6 h-6" />}
            title="You’re all caught up"
            description="No notifications in this filter right now. We’ll notify you when orders ship or try-on previews complete."
            actionLabel="Manage Preferences"
            actionHref="/account/settings"
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                  n.read ? 'bg-white border-stone-200' : 'bg-stone-50 border-stone-400 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0">
                    {iconForType(n.type)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-stone-950 flex items-center gap-2">
                      {n.title}
                      {!n.read && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                    </p>
                    <p className="text-xs text-stone-600">{n.message}</p>
                    <p className="text-[11px] text-stone-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {n.href && (
                  <Link
                    href={n.href}
                    className="text-xs font-bold underline underline-offset-4 text-stone-900 shrink-0"
                  >
                    Open →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MarketplaceShell>
  );
}

