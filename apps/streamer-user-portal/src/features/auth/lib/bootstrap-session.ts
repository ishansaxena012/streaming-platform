import { APP_CONSTANTS } from "../../../config/constants";
import type { Profile, User } from "../../../types";

// The API doesn't issue refresh tokens or profile lists yet, so a fresh
// session gets a locally-generated refresh token and a default profile pair
// until that lands on the backend.
export function bootstrapSession(user: Pick<User, "name">): {
  refreshToken: string;
  profiles: Profile[];
} {
  const refreshToken = "local-" + Math.random().toString(36).slice(2);

  const profiles: Profile[] = [
    {
      id: "prof-primary",
      name: user.name,
      avatarUrl: APP_CONSTANTS.DEFAULT_AVATARS[0].url,
      isKids: false,
    },
    {
      id: "prof-kids",
      name: "Kids",
      avatarUrl: APP_CONSTANTS.DEFAULT_AVATARS[2].url,
      isKids: true,
    },
  ];

  return { refreshToken, profiles };
}
