import "./App.css";
import AppProvider from "./contexts";
import RootNavigation from "./navigation";

function App() {
  return (
    <div className="w-full min-h-screen bg-bg flex flex-col">
      <AppProvider>
        <RootNavigation />
      </AppProvider>
    </div>
  );
}

export default App;
