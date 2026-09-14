import { KeyboardAdventure } from "@/components/KeyboardAdventure";
import { AudioProvider } from "@/components/AudioProvider";

export default function Home() {
  return (
    <AudioProvider>
      <KeyboardAdventure />
    </AudioProvider>
  );
}
