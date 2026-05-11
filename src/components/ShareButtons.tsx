import { Twitter, Send, Link as LinkIcon } from "lucide-react";

export function ShareButtons({ url, text }: { url: string; text: string }) {
  const enc = encodeURIComponent;
  const tw = `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`;
  const tg = `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`;

  return (
    <div className="flex gap-2 flex-wrap">
      <a href={tw} target="_blank" rel="noreferrer" className="btn-outline-neon text-xs inline-flex items-center gap-1.5">
        <Twitter className="w-3.5 h-3.5" /> Tweet
      </a>
      <a href={tg} target="_blank" rel="noreferrer" className="btn-outline-neon text-xs inline-flex items-center gap-1.5">
        <Send className="w-3.5 h-3.5" /> Telegram
      </a>
      <button
        onClick={async () => {
          if (navigator.share) {
            try { await navigator.share({ url, text }); } catch { /* ignore */ }
          } else {
            await navigator.clipboard.writeText(url);
          }
        }}
        className="btn-outline-neon text-xs inline-flex items-center gap-1.5"
      >
        <LinkIcon className="w-3.5 h-3.5" /> Share
      </button>
    </div>
  );
}
