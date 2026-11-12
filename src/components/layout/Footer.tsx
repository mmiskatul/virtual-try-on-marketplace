'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, X, ShieldCheck, Truck, HelpCircle, FileText } from 'lucide-react';

type PolicyTopic = 'faq' | 'shipping' | 'privacy' | 'terms' | 'support' | null;

const POLICY_DETAILS: Record<Exclude<PolicyTopic, null>, { title: string; points: string[] }> = {
  faq: {
    title: 'Frequently Asked Questions',
    points: [
      'How does Virtual Try-On work? Upload a clear front-facing photo and select any eligible garment to visualize natural fit and proportions before ordering.',
      'Why do brand storefronts have extra items? Participating brands curate a public brand storefront and selectively publish marquee items to the global marketplace.',
      'Can I buy from multiple brands together? Yes! Add items across different brands to one bag—checkout cleanly groups orders and delivery windows by brand seller.',
    ],
  },
  shipping: {
    title: 'Shipping & Brand Return Policies',
    points: [
      'Each independent brand fulfills directly from its verified atelier or warehouse within 1–5 business days.',
      'Single-brand baskets over ৳1,500 qualify for complimentary express courier shipping.',
      'Returns and size exchanges are handled transparently per brand (7–30 days depending on garment category).',
    ],
  },
  privacy: {
    title: 'Privacy & Customer Photo Retention',
    points: [
      'Customer photographs uploaded for Virtual Try-On require explicit consent before upload.',
      'Private photographs are never shared publicly or exposed to other shoppers or unrelated brands.',
      'You can delete any saved photo or try-on result anytime inside /account/settings or /account/try-on-history.',
    ],
  },
  terms: {
    title: 'Terms & Marketplace Governance',
    points: [
      'Only active, verified brands and explicitly published marketplace items appear in global marketplace feeds.',
      'Customers may place orders only for customer-visible in-stock items.',
      'Supported payment integrations include bKash, Nagad, Cards, and Cash on Delivery where eligible.',
    ],
  },
  support: {
    title: 'Customer Concierge Support',
    points: [
      'Order tracking & cancellations are available anytime under Account -> My Orders.',
      'Email: concierge@v-try.fashion • Support Hours: Saturday–Thursday, 9:00 AM – 8:00 PM BST.',
    ],
  },
};

export function Footer() {
  const [topic, setTopic] = useState<PolicyTopic>(null);

  return (
    <>
      <footer className="border-t border-stone-200 bg-white pt-14 pb-24 md:pb-12 px-4 sm:px-6 text-xs text-stone-600">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-stone-950 text-white font-serif font-bold flex items-center justify-center">
                V
              </div>
              <span className="font-serif font-bold text-lg tracking-wider text-stone-950">V-TRY</span>
            </Link>
            <p className="text-sm text-stone-600 leading-relaxed max-w-sm">
              A curated multi-brand fashion marketplace uniting independent ateliers and contemporary labels with AI-powered Virtual Try-On.
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-[11px] font-semibold text-stone-700">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Verified Brands Only
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-stone-900" /> AI Fitting Studio
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-stone-900" /> Direct Atelier Fulfillment
              </span>
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-widest text-[11px] text-stone-950">
              Marketplace
            </h4>
            <ul className="space-y-2">
              <li><Link href="/discover" className="hover:text-stone-950">Discover Products</Link></li>
              <li><Link href="/categories" className="hover:text-stone-950">Browse Categories</Link></li>
              <li><Link href="/brands" className="hover:text-stone-950">Explore Brands</Link></li>
              <li><Link href="/collections" className="hover:text-stone-950">Seasonal Collections</Link></li>
              <li><Link href="/try-on" className="hover:text-stone-950 font-semibold text-stone-900">Virtual Try-On Studio</Link></li>
            </ul>
          </div>

          {/* Account & Policies */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-widest text-[11px] text-stone-950">
              Customer Care
            </h4>
            <ul className="space-y-2">
              <li><Link href="/account" className="hover:text-stone-950">Customer Account</Link></li>
              <li><Link href="/account/orders" className="hover:text-stone-950">Orders & Tracking</Link></li>
              <li><button type="button" onClick={() => setTopic('support')} className="hover:text-stone-950">Customer Support</button></li>
              <li><button type="button" onClick={() => setTopic('faq')} className="hover:text-stone-950">FAQ</button></li>
              <li><button type="button" onClick={() => setTopic('shipping')} className="hover:text-stone-950">Shipping & Returns</button></li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-widest text-[11px] text-stone-950">
              Trust & Legal
            </h4>
            <ul className="space-y-2">
              <li><button type="button" onClick={() => setTopic('privacy')} className="hover:text-stone-950">Privacy Policy</button></li>
              <li><button type="button" onClick={() => setTopic('terms')} className="hover:text-stone-950">Terms & Conditions</button></li>
              <li className="pt-2 flex items-center gap-3 text-stone-500">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-stone-950 font-semibold">Instagram</a>
                <span>•</span>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-stone-950 font-semibold">Facebook</a>
                <span>•</span>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-stone-950 font-semibold">YouTube</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
          <p>© {new Date().getFullYear()} V-TRY Central Fashion Marketplace. Customer Shopping Edition.</p>
          <p>Multi-tenant storefronts • bKash, Nagad, Cards & Global Fulfillment Ready</p>
        </div>
      </footer>

      {topic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
                {topic === 'faq' ? <HelpCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                <h3>{POLICY_DETAILS[topic].title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setTopic(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-3 text-xs text-stone-600 leading-relaxed">
              {POLICY_DETAILS[topic].points.map((pt, i) => (
                <li key={i} className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
