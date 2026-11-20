import { Element } from "react-scroll";
import CTASection from "@/components/features/home/CTASection/CTASection";
import PricingSection from "@/components/features/home/PricingSection/PricingSection";
import RoleWorkflowSection from "@/components/features/home/RoleWorkflowSection/RoleWorkflowSection";
import SecuritySection from "@/components/features/home/SecuritySection/SecuritySection";
import SolutionSection from "@/components/features/home/SolutionSection/SolutionSection";
import SupportProblemSection from "@/components/features/home/SupportProblemSection/SupportProblemSection";
import WorkflowSection from "@/components/features/home/WorkflowSection/WorkflowSection";
import Hero from "@/components/features/home/Hero/Hero";

const Home = () => {
  return (
    <div>
      <Hero></Hero>
      <SupportProblemSection></SupportProblemSection>
      <Element name="features">
        <SolutionSection></SolutionSection>
      </Element>
      <RoleWorkflowSection></RoleWorkflowSection>
      <Element name="workflow">
        <WorkflowSection></WorkflowSection>
      </Element>
      <Element name="pricing">
        <PricingSection></PricingSection>
      </Element>
      <Element name="security">
        <SecuritySection></SecuritySection>
      </Element>
      <CTASection></CTASection>
    </div>
  );
};

export default Home;
