import React from 'react';
import { CircleHelp } from 'lucide-react';

const HelpTooltip = ({ text }) => (
  <span className="tooltip-wrapper">
    <CircleHelp className="h-3.5 w-3.5 text-[#2E75B6]" aria-hidden="true" />
    <span role="tooltip" className="tooltip-content">{text}</span>
  </span>
);

export default HelpTooltip;
