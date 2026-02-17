export default function ModalWrapper({ widthClass = "w-[600px]", children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className={`bg-white ${widthClass} rounded-xl p-8 shadow-xl`}>
        {children}
      </div>
    </div>
  );
}

