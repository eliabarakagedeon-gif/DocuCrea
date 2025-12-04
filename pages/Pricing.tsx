import React from 'react';
import { PRICING_TIERS } from '../constants';
import { Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { UserPlan } from '../types';
import { useNavigate } from 'react-router-dom';

const Pricing: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubscribe = (planId: string) => {
    if (planId === UserPlan.CREATOR) {
      // Redirect to PayPal
      window.open('https://www.paypal.com/ncp/payment/75MYV4TSND8XS', '_blank');
    } else if (planId === UserPlan.NGO) {
      // Redirect to Email
      window.location.href = 'mailto:mac-drc2025@outlook.fr';
    } else {
      // Free tier
      navigate('/create');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">{t.pricing.title}</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          {t.pricing.subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {PRICING_TIERS.map((tier) => {
           // Resolve translated data based on tier ID
           let planData;
           if (tier.id === UserPlan.FREE) planData = t.pricing.plans.free;
           else if (tier.id === UserPlan.CREATOR) planData = t.pricing.plans.creator;
           else planData = t.pricing.plans.ngo;

           return (
            <div 
              key={tier.id} 
              className={`relative rounded-2xl p-8 flex flex-col ${
                tier.highlight 
                  ? 'bg-gradient-to-b from-blue-900/40 to-slate-900 border border-blue-500 shadow-xl shadow-blue-900/20' 
                  : 'bg-slate-900 border border-slate-800'
              }`}
            >
              {tier.highlight && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                  Populaire
                </div>
              )}
              
              <h3 className="text-xl font-bold text-white mb-2">{planData.name}</h3>
              <div className="text-3xl font-bold text-white mb-6">{tier.price}</div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {planData.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleSubscribe(tier.id)}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                tier.highlight
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}>
                {planData.cta}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pricing;