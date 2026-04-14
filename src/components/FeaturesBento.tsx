"use client";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

const blank = <div className="flex h-full min-h-[8rem] w-full rounded-xl bg-[#1a2235]" />;

const items = [
  { title: "", description: "", header: blank, className: "md:col-span-1" },
  { title: "", description: "", header: blank, className: "md:col-span-1" },
  { title: "", description: "", header: blank, className: "md:col-span-1" },
  { title: "", description: "", header: blank, className: "md:col-span-2" },
  { title: "", description: "", header: blank, className: "md:col-span-1" },
  { title: "", description: "", header: blank, className: "md:col-span-1" },
  { title: "", description: "", header: blank, className: "md:col-span-2" },
];

export default function FeaturesBento() {
  return (
    <BentoGrid className="max-w-6xl mx-auto">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          className={item.className}
        />
      ))}
    </BentoGrid>
  );
}
