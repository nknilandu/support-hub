import { Element } from "react-scroll";
import Footer from "../../app/layouts/Footer/Footer";
import Navbar from "../../app/layouts/Navbar/Navbar";
import CTASection from "../../components/home/CTASection/CTASection";
import Hero from "../../components/home/Hero/Hero";
import PricingSection from "../../components/home/PricingSection/PricingSection";
import RoleWorkflowSection from "../../components/home/RoleWorkflowSection/RoleWorkflowSection";
import SecuritySection from "../../components/home/SecuritySection/SecuritySection";
import SolutionSection from "../../components/home/SolutionSection/SolutionSection";
import SupportProblemSection from "../../components/home/SupportProblemSection/SupportProblemSection";
import WorkflowSection from "../../components/home/WorkflowSection/WorkflowSection";

const home = () => {
  return (
    <div className="bg-base-200 min-h-screen">
      <Navbar></Navbar>
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
      <Footer></Footer>
    </div>
  );
};

export default home;
