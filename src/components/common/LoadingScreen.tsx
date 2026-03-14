const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-white z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute w-full h-full border-4 border-gray-100 rounded-full"></div>
          <div className="absolute w-full h-full border-4 border-red-500 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">
          Loading amazing things...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
