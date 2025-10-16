import Banner from "@/components/client/banner";
import React from "react";
import Categories from "@/components/client/Catagories";
import PopularServices from "@/components/client/PopularServices";
import WhyJoinSkillConnect from "@/components/client/WhyJoinSkillConnect";
import LandingPage from "@/components/client/LandingPage";
const page = () => {
  return (
    <div>
      <Banner />
      <Categories />
      <PopularServices />
      <LandingPage />
      <WhyJoinSkillConnect />
    </div>
  );
};

export default page;
