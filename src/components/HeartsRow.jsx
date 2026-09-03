import { Heart } from "lucide-react";
import { TOKENS, START_HEARTS } from "../theme.js";

export default function HeartsRow({ hearts, max = START_HEARTS }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => (
        <Heart key={i} size={18} fill={i < hearts ? TOKENS.coral : "none"} color={TOKENS.coral} />
      ))}
    </div>
  );
}
