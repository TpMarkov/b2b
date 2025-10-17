import HeroSection from "@/app/(marketing)/_components/hero-section";
import { ModeToggle } from "@/components/theme-provider/ThemeSwitcher";
import React from "react";

type Props = {};

const Home = (props: Props) => {
  return (
    <div>
      <HeroSection />
      <ModeToggle />
    </div>
  );
};

export default Home;
