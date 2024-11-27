import Header from "../components/Header";
import BountyForm from "../components/BountyForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Header />
        <main className="mt-12">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
            AI Bounty Generator
          </h1>
          <p className="text-center text-gray-600 mb-12">
            Describe your idea and let AI help you create the perfect bounty
          </p>
          <BountyForm />
        </main>
      </div>
    </div>
  );
}
