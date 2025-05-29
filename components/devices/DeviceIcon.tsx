/**
 * デバイスアイコンコンポーネント
 */

import { Mouse, Keyboard, Headphones, Mic, Monitor, HardDrive, Gamepad2, Armchair } from 'lucide-react';

interface DeviceIconProps {
  category: string;
  className?: string;
}

export function DeviceIcon({ category, className = 'h-5 w-5' }: DeviceIconProps) {
  switch (category) {
    case 'mouse':
      return <Mouse className={className} />;
    case 'keyboard':
      return <Keyboard className={className} />;
    case 'headset':
      return <Headphones className={className} />;
    case 'microphone':
      return <Mic className={className} />;
    case 'monitor':
      return <Monitor className={className} />;
    case 'capture_board':
      return <HardDrive className={className} />;
    case 'stream_deck':
      return <Gamepad2 className={className} />;
    case 'chair':
    case 'desk':
      return <Armchair className={className} />;
    default:
      return <HardDrive className={className} />;
  }
}
