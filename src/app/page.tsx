import { KeyboardAdventure } from "@/components/KeyboardAdventure";
import { AudioProvider } from "@/components/AudioProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <AudioProvider>
        <KeyboardAdventure />
      </AudioProvider>
    </ErrorBoundary>
  );
}
