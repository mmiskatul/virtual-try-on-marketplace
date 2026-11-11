'use client';

import React, { useState } from 'react';
import { Package, RotateCcw, Truck, XCircle } from 'lucide-react';
import { useMarketplaceStore } from '../../../stores/useMarketplaceStore';
import { useMounted } from '../../../hooks/useMounted';
import { AccountLayoutShell } from '../../../components/account/AccountSidebar';
import { EmptyState, SafeImage } from '../../../components/ui/States';
import { Button } from '../../../components/ui/button';

export default function AccountOrdersPage() {
  const mounted = useMounted();
  const orders = useMarketplaceStore((s) => s.orders);
  const cancelOrder = useMarketplaceStore((s) => s.cancelOrder);
  const requestReturnOrder = useMarketplaceStore((s) => s.requestReturnOrder);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const safeOrders = mounted ? orders : [];
  const visibleOrders =
    statusFilter === 'ALL' ? safeOrders : safeOrders.filter((o) => o.status === statusFilter);

  return (
    <AccountLayoutShell
      title="My Orders"
      subtitle="Track multi-brand shipments, courier references, cancellations, and return requests."
    >
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap ${
              statusFilter === s
                ? 'bg-stone-950 text-white border-stone-950'
                : 'bg-white text-stone-700 border-stone-200'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {visibleOrders.length === 0 ? (
        <EmptyState
          icon={<Package className="w-7 h-7" />}
          title="No orders found"
          description="Your confirmed marketplace and brand storefront purchases will appear here with per-brand tracking."
          actionLabel="Explore Styles"
          actionHref="/discover"
        />
      ) : (
        <div className="space-y-5">
          {visibleOrders.map((order) => (
            <div key={order.id} className="rounded-3xl border border-stone-200 bg-white overflow-hidden">
              <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-mono font-bold text-stone-950">Order {order.id}</p>
                  <p className="text-stone-500">
                    Placed {new Date(order.createdAt).toLocaleString()} • {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {order.trackingCode && (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2.5 py-1 rounded-full bg-white border border-stone-200">
                      <Truck className="w-3.5 h-3.5" /> {order.trackingCode}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-stone-950 text-white font-bold text-[11px]">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {order.groups.map((g) => (
                  <div key={g.orderRef} className="rounded-2xl border border-stone-200 p-4 space-y-3">
                    <div className="flex flex-wrap justify-between text-xs border-b border-stone-100 pb-2">
                      <span className="font-bold text-stone-950">{g.brandName}</span>
                      <span className="text-stone-500">
                        Seller Ref: {g.orderRef} • {g.deliveryMethod}
                      </span>
                    </div>
                    {g.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                            <SafeImage src={item.product.image} alt={item.product.name} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-stone-900">{item.product.name}</p>
                            <p className="text-stone-500">Size {item.size} × {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ))}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
                  <span className="font-extrabold text-base text-stone-950">
                    Total Paid: ${order.totalAmount.toFixed(2)}
                  </span>
                  <div className="flex gap-2">
                    {order.status === 'PROCESSING' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelOrder(order.id)}
                        className="gap-1.5 text-rose-600"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel Order
                      </Button>
                    )}
                    {order.status === 'DELIVERED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => requestReturnOrder(order.id)}
                        className="gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Request Return
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AccountLayoutShell>
  );
}

