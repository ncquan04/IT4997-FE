import PageTransition from "../../components/common/PageTransition";
import { HORIZONTAL_PADDING_REM } from "../../constants";
import Info from "./components/Info";
import Leaders from "./components/Leaders";
import OurStory from "./components/OurStory";

const AboutPage = () => {
  return (
    <PageTransition>
      <main
        className="flex flex-1 w-full flex-col gap-8 md:gap-16 lg:gap-32 px-4 sm:px-6 md:px-8 lg:px-[var(--horizontal-padding)]"
        style={
          {
            "--horizontal-padding": `${HORIZONTAL_PADDING_REM}rem`,
          } as React.CSSProperties
        }
      >
        <OurStory />
        <Info />
        <Leaders />
      </main>
    </PageTransition>
  );
};

export default AboutPage;
