const Backdrop = () => {
  return (
    <div className="fixed inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-bgPrimary via-primary to-bgPrimary opacity-80" />
      <div className="absolute inset-0 backdrop-blur-sm" />
    </div>
  );
};
export default Backdrop;
