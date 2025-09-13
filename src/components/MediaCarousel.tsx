"use client";
import Image from "next/image";
import { useState } from "react";
import { MediaItem } from "@/types/product";

export default function MediaCarousel({ media }: { media: MediaItem[] }) {
  const [i, setI] = useState(0);
  const go = (d:number)=> setI((i+d+media.length)%media.length);
  const curr = media[i];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black/30">
      <div className="aspect-[16/12]">
        {curr?.type === "image" ? (
          <Image src={(curr as any).url} alt="" fill className="object-cover" />
        ) : (
          <video
            controls playsInline
            poster={(curr as any).poster}
            className="h-full w-full object-cover"
            src={(curr as any).url}
          />
        )}
      </div>

      <button onClick={()=>go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white">‹</button>
      <button onClick={()=>go(+1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white">›</button>

      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/40 px-2 py-1">
        {media.map((_,idx)=>(
          <button key={idx} onClick={()=>setI(idx)} className={`h-2 w-2 rounded-full ${idx===i?"bg-white":"bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}