// In packages/client/src/components/ChatHeader.tsx
import { ChevronLeft, Phone, Video, User } from 'lucide-react'; // Add User import
import { usePresence } from '@/context/PresenceContext'; // Import presence hook
import { formatDistanceToNow } from 'date-fns';

// Define the props interface
interface ChatHeaderProps {
  partner: {
    id: string;
    username: string;
    profilePicUrl?: string | null; // Make sure this is in the type
  } | null;
}

export default function ChatHeader({ partner }: ChatHeaderProps) {
  const presence = usePresence();
  const partnerStatus = partner ? presence[partner.id] : null;

  const renderStatus = () => {
    if (!partner) return 'Loading...';
    if (partnerStatus?.isOnline) {
      return <span className="text-green-400">Active now</span>;
    }
    if (partnerStatus?.lastSeen) {
      return `Active ${formatDistanceToNow(new Date(partnerStatus.lastSeen))} ago`;
    }
    return 'Offline'; // Fallback
  };
  return (
    <div className="flex items-center justify-between p-3 border-b border-zinc-800">
      <div className="flex items-center gap-4">
        <ChevronLeft size={24} className="cursor-pointer" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-700 rounded-full cursor-pointer flex items-center justify-center overflow-hidden">
            {/* --- MODIFIED AVATAR LOGIC --- */}
            {partner?.profilePicUrl ? (
                <img src={partner.profilePicUrl} alt={partner.username} className="w-full h-full object-cover" />
            ) : (
                <User className="text-zinc-400" />
            )}
          </div>
          <div>
            {/* Use dynamic username, with a fallback while loading */}
            <h2 className="font-semibold">{partner ? partner.username : 'Loading...'}</h2>
            <p className="text-xs text-zinc-400">{renderStatus()}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <Phone size={24} className="cursor-pointer" />
        <Video size={24} className="cursor-pointer" />
      </div>
    </div>
  );
}
