import React from 'react';
import ReactDOM from 'react-dom/client';
import DisasterPreparednessCalculator from './disaster-preparedness-dashboard';
import './styles/tailwind.css'; // TailwindでビルドされたCSSをインポート

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <DisasterPreparednessCalculator />
  </React.StrictMode>
);