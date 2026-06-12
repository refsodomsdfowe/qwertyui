import { useState } from "react";

export default function Home() {
  const [rating, setRating] = useState(0);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">GAME GENERATED :</h1>
        <a
          className="text-xl underline break-all"
          href="https://www.roblox.com/games/95831424846543/lolsf-8943"
          target="_blank"
          rel="noreferrer"
        >
          https://www.roblox.com/games/95831424846543/lolsf-8943
        </a>
        <a
          href="https://discord.gg/condohub"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/discord.svg" alt="Discord" className="w-6 h-6"/>
          <span>Join our Discord server gg/condohub</span>
        </a>
        <div className="mt-4">
          <div className="text-lg font-semibold mb-2">Rate your experience</div>
          <div className="flex justify-center space-x-1">
            {[1,2,3,4,5].map((n) => (
              <button key={n} onClick={() => setRating(n)}>
                <span className={`text-3xl ${rating >= n ? "text-yellow-400" : "text-gray-400"}`}>&#9733;</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
