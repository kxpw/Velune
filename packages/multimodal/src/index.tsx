export type VoiceChannelProps = {
  lang?: string;
  onTranscript?: (text: string) => void;
};

export function VoiceChannel({
  lang = "en-US",
  onTranscript,
}: VoiceChannelProps) {
  void lang;
  void onTranscript;
  throw new Error("VoiceChannel is experimental and is not implemented yet.");
}
