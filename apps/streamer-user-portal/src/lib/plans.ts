import type { SubscriptionPlan } from "../types";

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "basic-plan",
    name: "Basic",
    price: 4.99,
    interval: "month",
    features: [
      "720p HD streaming",
      "Watch on 1 device at a time",
      "Includes ads",
      "Mobile and tablet supported",
    ],
    isPopular: false,
  },
  {
    id: "standard-plan",
    name: "Standard",
    price: 9.99,
    interval: "month",
    features: [
      "1080p Full HD streaming",
      "Watch on 2 devices at once",
      "Ad-free",
      "Offline downloads",
    ],
    isPopular: true,
  },
  {
    id: "premium-plan",
    name: "Premium",
    price: 14.99,
    interval: "month",
    features: [
      "4K Ultra HD & HDR",
      "Watch on 4 devices at once",
      "Dolby Atmos surround sound",
      "Early access to new releases",
      "Priority support",
    ],
    isPopular: false,
  },
];
