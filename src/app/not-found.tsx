import Link from 'next/link';
import { Button } from '../components/ui/button';

export default function MarketplaceNotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full fashion-card rounded-2xl border border-slate-800 p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
          404
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Collection Not Found
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            The runway look, designer collection, or page you are looking for does not exist or has been archived.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/">
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-purple-600/25"
            >
              Return to Central Marketplace
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
