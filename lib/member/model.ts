export type Member = {
  id: string; email: string; first_name: string | null; last_name: string | null;
  membership_plan: string | null; membership_status: string | null;
  vehicle_make: string | null; vehicle_model: string | null; vehicle_color: string | null;
  license_plate: string | null; rewards_points: number | null; lifetime_washes: number | null;
  billingAvailable: boolean;
}
export type Visit = { id: string; created_at: string; membership_plan: string | null }
export type MemberData = { member: Member | null; visits: Visit[]; visitsUnavailable: boolean }
export const plans = [
  { name: "Gecko", price: "24.99", image: "/gecko.png", description: "Everyday clean, made easy.", features: ["Exterior wash", "Dry", "Free vacuums"] },
  { name: "Iguana", price: "34.99", image: "/iguana.png", description: "A deeper clean. A brighter finish.", features: ["Everything in Gecko", "Wheel clean", "Tire shine", "Spot-free rinse"] },
  { name: "Dragon", price: "44.99", image: "/dragon.png", description: "Our premium protection experience.", features: ["Everything in Iguana", "Ceramic protectant", "Premium finish"] },
]
export const rewardLevels = [
  { points: 50, reward: "Free Air Freshener" }, { points: 100, reward: "Free Wash Upgrade" },
  { points: 250, reward: "Braxy Buns T-Shirt" }, { points: 500, reward: "Founder VIP Status" },
]
export function rewardProgress(points: number) {
  const next = rewardLevels.find(level => points < level.points)
  const previous = [...rewardLevels].reverse().find(level => points >= level.points)?.points || 0
  return { next, percent: next ? Math.min(100, Math.max(0, (points - previous) / (next.points - previous) * 100)) : 100 }
}
