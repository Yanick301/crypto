import React, { ReactNode } from 'react';

interface InstructionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  subtext: string;
}

export const InstructionCard: React.FC<InstructionCardProps> = ({ icon, title, description, subtext }) => {
  return (
    <div className="step">
      {icon}
      <p>
        <strong>{title}</strong>
        <br />
        {description}
        <br />
        <small>{subtext}</small>
      </p>
    </div>
  );
};