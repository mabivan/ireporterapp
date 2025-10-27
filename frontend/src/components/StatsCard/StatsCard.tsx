import React from 'react';
import './StatsCard.css';

interface StatsCardProps {
  title: string;
  value: number;
  type: 'red-flag' | 'intervention' | 'resolved' | 'pending' | 'rejected';
  change?: number;
  icon: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  type, 
  change, 
  icon 
}) => {
  const getChangeText = () => {
    if (!change) return null;
    
    const isPositive = change >= 0;
    const sign = isPositive ? '+' : '';
    
    return (
      <span className={`stats-change ${isPositive ? 'positive' : 'negative'}`}>
        {sign}{change}% from last week
      </span>
    );
  };

  return (
    <div className="stats-card">
      <div className="stats-header">
        <div className="stats-content">
          <h3>{title}</h3>
          <p className="stats-value">{value}</p>
          {getChangeText()}
        </div>
        <div className={`stats-icon ${type}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;