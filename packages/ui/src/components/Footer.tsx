import * as React from "react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-100 bg-slate-50/50 py-12 px-6 transition-premium">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand & Mission */}
        <div className="space-y-4">
          <span className="text-xl font-bold text-slate-800">
            LeadFlow
          </span>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
            Premium Shopify store leads with real marketing-signal detection. Grow your sales pipeline faster.
          </p>
        </div>

        {/* Product Links */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-800">Product</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><a href="#features" className="hover:text-indigo-600 transition-colors">Features</a></li>
            <li><a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
            <li><a href="/preview" className="hover:text-indigo-600 transition-colors">Data Preview</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-800">Resources</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a></li>
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Support</a></li>
          </ul>
        </div>

        {/* Legal & Company */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-800">Company</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
            <li><a href="/login" className="hover:text-indigo-600 transition-colors">Login</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-100 text-center text-sm text-slate-400">
        <p>© {new Date().getFullYear()} LeadFlow. All rights reserved.</p>
      </div>
    </footer>
  );
}
