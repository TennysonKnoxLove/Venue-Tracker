import { useState } from 'react';

const SnoozeDialog = ({ open, onCancel, onConfirm }) => {
  const [snoozeTime, setSnoozeTime] = useState('15');

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-300 border-2 border-gray-400 shadow-md w-80">
        <div className="bg-blue-900 text-white p-1 font-bold flex justify-between items-center">
          <span>Snooze Reminder</span>
          <button onClick={onCancel} className="text-white hover:text-gray-300">✕</button>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <label className="block mb-2">Remind me again in:</label>
            <select
              className="w-full p-1 border-2 border-gray-400 bg-white"
              value={snoozeTime}
              onChange={(e) => setSnoozeTime(e.target.value)}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="360">6 hours</option>
              <option value="720">12 hours</option>
              <option value="1440">1 day</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button onClick={onCancel} className="btn-win98">
              Cancel
            </button>
            <button onClick={() => onConfirm(snoozeTime)} className="btn-win98">
              Snooze
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnoozeDialog;
