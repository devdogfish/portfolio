import Image from "next/image";

export default function SquareImage({
  src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
  alt = "Square image",
  width = "w-16",
}) {
  return (
    <div
      className={`${width} aspect-square relative overflow-hidden rounded-lg`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
        sizes="(max-width: 768px) 100vw, 64px"
      />
    </div>
  );
}
