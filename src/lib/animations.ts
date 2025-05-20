import { Variants } from "framer-motion";

// Fade in animation
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  },
};

// Slide up animation
export const slideUp: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24 
    }
  },
};

// Slide in from left animation
export const slideInLeft: Variants = {
  hidden: { x: -50, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24 
    }
  },
};

// Slide in from right animation
export const slideInRight: Variants = {
  hidden: { x: 50, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24 
    }
  },
};

// Scale up animation
export const scaleUp: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24 
    }
  },
};

// Staggered children animation container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

// Pulse animation for buttons
export const pulse: Variants = {
  hidden: { scale: 1 },
  visible: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { 
      duration: 0.3,
      yoyo: Infinity,
      ease: "easeInOut" 
    }
  },
  tap: { scale: 0.95 }
};

// Floating animation for Hello Kitty theme
export const floating: Variants = {
  hidden: { y: 0 },
  visible: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
};

// Rotate animation for settings icon
export const rotate: Variants = {
  hidden: { rotate: 0 },
  visible: { rotate: 0 },
  hover: { 
    rotate: 180,
    transition: { duration: 0.5 }
  }
};

// Wave animation for results that stops after 3 seconds
export const wave: Variants = {
  hidden: { rotate: 0, y: 0 },
  visible: {
    rotate: [0, 5, 0, -5, 0],
    y: [0, -2, 0, -2, 0],
    transition: {
      duration: 2,
      repeat: 1,  // Only repeat once (total animation time: ~3 seconds)
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
};

// Theme change animation
export const themeChange: Variants = {
  exit: { 
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 }
  },
  enter: { 
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 }
  }
};
