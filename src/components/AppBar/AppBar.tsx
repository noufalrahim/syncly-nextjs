import type React from "react";
import { Button } from "../ui/button";

interface IAppBarProps {
  title: string;
  description: string;
  buttons?: {
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
  }[];
}

export default function AppBar({ title, description, buttons }: IAppBarProps) {
  return (
    <div className="my-5 flex flex-row items-center justify-between px-5">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-md italic text-mutedDark">{description}</p>
      </div>
      <div className="flex gap-2">
        {buttons &&
          buttons.length > 0 &&
          buttons.map((btn, index) => (
            <Button
              key={index}
              onClick={btn.onClick}
              className="flex flex-row items-center justify-between gap-2 rounded-md border border-black px-2 py-1 transition duration-100 hover:text-white"
            >
              <span className="ml-2">{btn.title}</span>
              {btn.icon}
            </Button>
          ))}
      </div>
    </div>
  );
}
