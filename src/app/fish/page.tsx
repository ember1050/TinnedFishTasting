import { getAllFishWithStats } from "@/lib/data";
import { rankFish } from "@/lib/scoring";
import { FishTable } from "@/components/FishTable";

export default async function FishListPage() {
  const allFish = await getAllFishWithStats();
  const reviewed = allFish.filter((f) => f.avg_overall !== null);
  const globalAvg =
    reviewed.length > 0
      ? reviewed.reduce((sum, f) => sum + f.avg_overall!, 0) / reviewed.length
      : 5;
  const ranked = rankFish(allFish, globalAvg);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Tinned Fish</h1>
        <p className="text-gray-500 mt-1">
          {allFish.length} products • Sorted by community ranking
        </p>
      </div>
      <FishTable fish={ranked} />
    </div>
  );
}
