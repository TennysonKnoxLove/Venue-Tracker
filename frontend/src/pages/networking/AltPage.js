const AltPage = ({ loading, error, opportunity }) => {
  if (loading) {
    return (
      <div className="text-center p-12">
        <div className="border border-gray-400 bg-gray-200 shadow p-4 inline-block">
          <div>Loading opportunity details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12">
        <div className="border border-gray-400 bg-red-100 shadow p-4 inline-block">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="text-center p-12">
        <div className="border border-gray-400 bg-red-100 shadow p-4 inline-block">
          <div className="text-red-600">Opportunity not found</div>
        </div>
      </div>
    );
  }

  return null;
};

export default AltPage;
