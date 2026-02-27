import React, { useEffect, useRef } from "react";
// import { createAnimation } from "@ionic/react";

import "./SplashScreen.css";

interface SplashScreenProps {
  duration?: number;
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  duration = 1500,
  onFinish,
}) => {
  const splashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      //   setVisible(false);
      if (onFinish) onFinish();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onFinish]);

  //   useEffect(() => {
  //     if (!splashRef.current) return;

  //     const el = splashRef.current;

  //     // ENTER animation
  //     // const enter = createAnimation()
  //     //   .addElement(el)
  //     //   .duration(400)
  //     //   .easing("ease-out")
  //     //   .fromTo("opacity", "0", "1");

  //     // enter.play();

  //     const timer = setTimeout(() => {
  //       // EXIT animation
  //       //   const leave = createAnimation()
  //       //     .addElement(el)
  //       //     .duration(400)
  //       //     .easing("ease-in")
  //       //     .fromTo("opacity", "1", "0")
  //       //     .onFinish(() => {
  //       //       onFinish(); // notify parent AFTER fade out
  //       //     });

  //       //   leave.play();
  //     }, duration);

  //     return () => clearTimeout(timer);
  //   }, [duration, onFinish]);

  return (
    <div ref={splashRef} className="splash-screen">
      <img className="splash-logo" src="/assets/splash-screen.png" alt="logo" />
      <p className="splash-text">Powered by TerraUI</p>
    </div>
  );
};

export default SplashScreen;
