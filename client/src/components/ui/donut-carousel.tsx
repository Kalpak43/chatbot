"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselItem {
  id: number;
  title: string;
  content: string;
  color: string;
}

const items: CarouselItem[] = [
  { id: 1, title: "Item 1", content: "First item", color: "bg-red-500" },
  { id: 2, title: "Item 2", content: "Second item", color: "bg-blue-500" },
  { id: 3, title: "Item 3", content: "Third item", color: "bg-green-500" },
  { id: 4, title: "Item 4", content: "Fourth item", color: "bg-yellow-500" },
  { id: 5, title: "Item 5", content: "Fifth item", color: "bg-purple-500" },
  { id: 6, title: "Item 6", content: "Sixth item", color: "bg-pink-500" },
  { id: 7, title: "Item 7", content: "Seventh item", color: "bg-indigo-500" },
  { id: 8, title: "Item 8", content: "Eighth item", color: "bg-orange-500" },
];

export default function DonutCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalItems = items.length;
  const angleStep = 360 / totalItems;
  const radius = 180; // Distance from center

  const handleItemClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        {/* Carousel Container */}
        <div className="relative w-[500px] h-[500px] mx-auto">
          {/* Center point indicator */}
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-gray-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10"></div>

          <div
            className="relative w-full h-full transition-transform duration-700 ease-in-out"
            style={{
              transform: `rotate(${ (-currentIndex * angleStep) - 90}deg)`,
            }}
          >
            {items.map((item, index) => {
              const angle = index * angleStep * (Math.PI / 180); // Convert to radians
              const x = Math.sin(angle) * radius;
              const y = -Math.cos(angle) * radius; // Negative because CSS y-axis is inverted
              const isActive = index === currentIndex;

              return (
                <div
                  key={item.id}
                  className="absolute cursor-pointer transition-all duration-300"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: `translate(-50%, -50%) rotate(${
                      (currentIndex * angleStep) + 90
                    }deg)`, // Counter-rotate to keep items upright
                  }}
                  onClick={() => handleItemClick(index)}
                >
                  <Card
                    className={`transition-all duration-300 ${
                      isActive
                        ? "w-24 h-32 scale-125 shadow-2xl ring-4 ring-blue-500 z-20"
                        : "w-20 h-28 scale-100 opacity-70 hover:opacity-90 hover:scale-105"
                    }`}
                  >
                    <CardContent
                      className={`${item.color} h-full flex flex-col items-center justify-center text-white p-2 rounded-lg`}
                    >
                      <div
                        className={`font-bold text-center ${
                          isActive ? "text-sm" : "text-xs"
                        }`}
                      >
                        {item.title}
                      </div>
                      <div
                        className={`text-center mt-1 opacity-90 ${
                          isActive ? "text-xs" : "text-[10px]"
                        }`}
                      >
                        {item.content}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
