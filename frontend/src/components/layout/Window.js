const Window = ({ title, children, className = '' }) => {
  return (
    <div className={`window ${className}`}>
      <div className="window-title">
        <div className="px-2">{title}</div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default Window;
