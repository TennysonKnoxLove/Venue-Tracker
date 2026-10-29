const DiscoveryAlert = ({ open, message, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
      <div className="w-80 bg-[#c0c0c0] border-2 border-[#dfdfdf] border-t-2 border-l-2 border-r-[#404040] border-b-[#404040] shadow-md">
        <div className="bg-[#000080] text-white p-1 flex justify-between items-center">
          <div className="font-bold text-sm">Windows 98</div>
          <button
            onClick={onClose}
            className="bg-[#c0c0c0] text-black w-4 h-4 flex items-center justify-center text-xs border border-[#dfdfdf] border-r-[#404040] border-b-[#404040]"
          >
            x
          </button>
        </div>
        <div className="p-4 flex flex-col items-center">
          <div className="flex mb-4">
            <div className="mr-3 text-2xl">ℹ️</div>
            <div className="text-sm">{message}</div>
          </div>
          <button
            onClick={onClose}
            className="bg-[#c0c0c0] px-4 py-1 text-sm border-2 border-[#dfdfdf] border-t-2 border-l-2 border-r-[#404040] border-b-[#404040] active:border-[#404040] active:border-t-2 active:border-l-2 active:border-r-[#dfdfdf] active:border-b-[#dfdfdf]"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryAlert;
