import { Element } from "react-scroll";
import CTASection from "../../components/home/CTASection/CTASection";
import PricingSection from "../../components/home/PricingSection/PricingSection";
import RoleWorkflowSection from "../../components/home/RoleWorkflowSection/RoleWorkflowSection";
import SecuritySection from "../../components/home/SecuritySection/SecuritySection";
import SolutionSection from "../../components/home/SolutionSection/SolutionSection";
import SupportProblemSection from "../../components/home/SupportProblemSection/SupportProblemSection";
import WorkflowSection from "../../components/home/WorkflowSection/WorkflowSection";
import Hero from "../../components/home/Hero/Hero";

const home = () => {
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

export default home;
