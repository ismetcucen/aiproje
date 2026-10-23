import React from 'react';
import BlocklyEditor from '../components/robotics/BlocklyEditor';
import { useAuth } from '../hooks/useAuth';

export default function RoboticsPage() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            OHEP Robotik Kodlama (ESP32)
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            Blokları sürükleyip bırakın, kodunuz anında robota yüklenecek hale gelsin.
          </p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl text-indigo-400 text-sm font-bold flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Sim2Real Aktif
        </div>
      </div>

      <div className="flex-1">
        <BlocklyEditor />
      </div>
    </div>
  );
}
