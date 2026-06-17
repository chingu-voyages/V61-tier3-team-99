import Header from "./components/Header";

const App = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center">
        <p className="text-muted-foreground">Coming soon!</p>
      </main>
    </div>
  );
};

export default App;
