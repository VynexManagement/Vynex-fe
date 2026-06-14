'use client'

import Link from 'next/link';
import { Zap} from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-[#00adb5]/20 bg-[#222831]/80 backdrop-blur-md py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand & Mission */}
        <div className="col-span-1 md:col-span-1 space-y-4">
          <div className="inline-flex items-center gap-2">
            <Zap className="text-[#00adb5] w-6 h-6" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00adb5] to-[#ffd6ba]">
              LeadFlow
            </span>
          </div>
          <p className="text-sm text-[#eeeeee]/60">
            Premium Shopify store leads with real marketing-signal detection. Grow your sales pipeline faster.
          </p>
          <div className="flex items-center gap-4 text-[#eeeeee]/40">
            <a href="#" className="hover:text-[#00adb5] transition-colors">X</a>
            <a href="#" className="hover:text-[#00adb5] transition-colors">GitHub</a>
            <a href="#" className="hover:text-[#00adb5] transition-colors">LinkedIn</a>
          </div>
        </div>

        {/* Product Links */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-[#eeeeee]">Product</h4>
          <ul className="space-y-2 text-sm text-[#eeeeee]/60">
            <li><Link href="#features" className="hover:text-[#00adb5] transition-colors">Features</Link></li>
            <li><Link href="#pricing" className="hover:text-[#00adb5] transition-colors">Pricing</Link></li>
            <li><Link href="/preview" className="hover:text-[#00adb5] transition-colors">Data Preview</Link></li>
            <li><Link href="/query" className="hover:text-[#00adb5] transition-colors">Explore Niches</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-[#eeeeee]">Resources</h4>
          <ul className="space-y-2 text-sm text-[#eeeeee]/60">
            <li><Link href="#" className="hover:text-[#00adb5] transition-colors">Documentation</Link></li>
            <li><Link href="#" className="hover:text-[#00adb5] transition-colors">Blog</Link></li>
            <li><Link href="#" className="hover:text-[#00adb5] transition-colors">Case Studies</Link></li>
            <li><Link href="#" className="hover:text-[#00adb5] transition-colors">API Reference</Link></li>
          </ul>
        </div>

        {/* Legal & Admin */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-[#eeeeee]">Company</h4>
          <ul className="space-y-2 text-sm text-[#eeeeee]/60">
            <li><Link href="#" className="hover:text-[#00adb5] transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-[#00adb5] transition-colors">Terms of Service</Link></li>
            <li><Link href="/login" className="hover:text-[#00adb5] transition-colors">Login</Link></li>
            <li><Link href="/admin" className="hover:text-[#00adb5] transition-colors bg-[#00adb5]/10 px-2 py-0.5 rounded text-[#00adb5] inline-block font-medium mt-2">Admin Portal</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-sm text-[#eeeeee]/40">
        <p>© {new Date().getFullYear()} LeadFlow. All rights reserved.</p>
      </div>
    </footer>
  );
}
