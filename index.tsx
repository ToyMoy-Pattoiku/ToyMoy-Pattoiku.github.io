import React from 'react';
import { createRoot } from 'react-dom/client';
import DisasterPreparednessCalculator from './disaster-preparedness-dashboard';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<DisasterPreparednessCalculator />);
