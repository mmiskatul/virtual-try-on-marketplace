import Link from 'next/link';
import { Button } from '../components/ui/button';

export default function MarketplaceNotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full fashion-card rounded-2xl border border-gray-200 p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-black via-black to-black">
          404
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Collection Not Found
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            The runway look, designer collection, or page you are looking for does not exist or has been archived.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/">
            <Button
              className="w-full bg-gradient-to-r from-black to-black hover:from-black hover:to-black text-white font-medium shadow-lg shadow-black/10"
            >
              Return to Central Marketplace
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
