'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, Sparkles, Trash2, X } from 'lucide-react';
import { TryOnResultRecord } from '../../../types';
import { useMarketplaceStore } from '../../../stores/useMarketplaceStore';
import { useMounted } from '../../../hooks/useMounted';
import { AccountLayoutShell } from '../../../components/account/AccountSidebar';
import { BeforeAfterSlider } from '../../../components/try-on/BeforeAfterSlider';
import { EmptyState, SafeImage } from '../../../components/ui/States';
import { Button } from '../../../components/ui/button';

export default function TryOnHistoryPage() {
  const mounted = useMounted();
  const history = useMarketplaceStore((s) => s.tryOnHistory);
  const deleteRecord = useMarketplaceStore((s) => s.deleteTryOnRecord);
  const clearHistory = useMarketplaceStore((s) => s.clearTryOnHistory);
  const [inspectItem, setInspectItem] = useState<TryOnResultRecord | null>(null);

  const safeHistory = mounted ? history : [];

  return (
    <AccountLayoutShell
      title={`Virtual Try-On History (${safeHistory.length})`}
      subtitle="Review previously generated virtual fitting results or delete private look records anytime."
    >
      {safeHistory.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={clearHistory} className="text-rose-600 gap-1.5">
            <Trash2 className="w-3.5 h-3.5" /> Clear All History
          </Button>
        </div>
      )}

      {safeHistory.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-7 h-7" />}
          title="No saved try-on generations"
          description="Your virtual try-on previews are saved privately here whenever you generate a look inside the Try-On Studio."
          actionLabel="Open Virtual Try-On Studio"
          actionHref="/try-on"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {safeHistory.map((item) => (
            <div key={item.id} className="fashion-card rounded-2xl overflow-hidden flex flex-col justify-between">
              <div className="relative aspect-[3/4] bg-stone-100">
                <SafeImage src={item.resultImageUrl} alt={item.productName} fill className="object-cover" />
                <span
                  className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.mode === 'live_ai'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  {item.mode === 'live_ai' ? 'Live AI' : 'Demo Preview'}
                </span>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <Link href={`/brands/${item.brandSlug}`} className="text-[10px] font-bold uppercase text-stone-500">
                    {item.brandName}
                  </Link>
                  <Link href={`/products/${item.productSlug}`} className="block font-bold text-xs text-stone-950 truncate hover:underline">
                    {item.productName}
                  </Link>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {new Date(item.createdAt).toLocaleDateString()} • Size {item.size || 'M'}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                  <Button size="sm" variant="outline" onClick={() => setInspectItem(item)} className="flex-1 gap-1">
                    <Eye className="w-3.5 h-3.5" /> Compare
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteRecord(item.id)}
                    className="text-rose-600 px-2.5"
                    aria-label="Delete try-on record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {inspectItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 space-y-4 relative">
            <button
              type="button"
              onClick={() => setInspectItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[11px] font-bold uppercase text-stone-500">{inspectItem.brandName}</p>
              <h3 className="font-serif text-lg font-bold">{inspectItem.productName}</h3>
            </div>
            <BeforeAfterSlider
              beforeUrl={inspectItem.personImageUrl}
              afterUrl={inspectItem.resultImageUrl}
            />
          </div>
        </div>
      )}
    </AccountLayoutShell>
  );
}

