export type Theme = {
  name: string;
  id: string;
  className: string;
  colors: {
    primary: string;
    background: string;
    card: string;
    accent: string;
  };
};

export const themes: Theme[] = [
  {
    name: "Dark",
    id: "dark",
    className: "theme-dark dark",
    colors: {
      primary: "slate",
      background: "black",
      card: "slate-900",
      accent: "slate",
    },
  },
  {
    name: "Light",
    id: "light",
    className: "theme-light",
    colors: {
      primary: "stone",
      background: "white",
      card: "white",
      accent: "stone",
    },
  },
  {
    name: "Hello Kitty",
    id: "hello-kitty",
    className: "theme-hello-kitty",
    colors: {
      primary: "pink",
      background: "white",
      card: "white",
      accent: "pink",
    },
  },
];
