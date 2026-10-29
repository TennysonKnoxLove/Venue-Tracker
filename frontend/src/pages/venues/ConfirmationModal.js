import Button from '../../components/layout/Button';

const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Confirm Action</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-2">
          <Button type="button" onClick={onCancel}>Cancel</Button>
          <Button type="button" onClick={onConfirm} className="bg-red-100">Confirm</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
