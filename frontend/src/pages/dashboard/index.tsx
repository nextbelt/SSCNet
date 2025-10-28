import React from 'react';
import { useRouter } from 'next/router';
import BuyerDashboard from './buyer';

const Dashboard = () => {
  const router = useRouter();
  const { view } = router.query;

  // Default to buyer dashboard for now
  return <BuyerDashboard />;
};

export default Dashboard;