import React from 'react';
import { useLocation } from 'react-router-dom';

const Breadcrumb = ({text}) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const lastPath = pathnames[pathnames.length - 1];

  const formatTitle = (path) => {
    if (!path) return '';
    
    const customTitles = {
      'admin': 'Admin',
      'owner': 'Owner',
      'ai-training': 'AI Training',
      'item-management': 'Item Management',
      'call-summary': 'Call Summary',
      'order-list': 'Order List',
      'subscription': 'Subscription',
      'dashboard': 'Dashboard'
    };

    if (customTitles[path.toLowerCase()]) {
      return customTitles[path.toLowerCase()];
    }

    return path
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="mb-6">
      <h1 className="text-white text-xl md:text-2xl font-medium tracking-tight">
        {formatTitle(lastPath)}
      </h1>

      <p className="text-[#909090] text-sm md:text-base mt-1 ">{text}</p>
    </div>
  );
};

export default Breadcrumb;

