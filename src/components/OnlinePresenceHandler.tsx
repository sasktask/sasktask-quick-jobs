import { useAuth } from "@/hooks/useAuthContext";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";

/**
 * Handles online/offline status for signed-in users.
 * - When user signs in: marks them online and starts heartbeat
 * - When user signs out or closes browser: useOnlinePresence cleanup + signOut mark offline
 */
export function OnlinePresenceHandler() {
  const { user } = useAuth();
  useOnlinePresence(user?.id);
  return null;
}
