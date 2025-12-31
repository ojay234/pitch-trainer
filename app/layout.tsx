import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "../components/Header";
import clsx from "clsx";
import "./globals.css";

const helveticaNowDisplay = localFont({
  src: [
    {
      path: "../fonts/HelveticaNowDisplay-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../fonts/HelveticaNowDisplay-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../fonts/HelveticaNowDisplay-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/HelveticaNowDisplay-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/HelveticaNowDisplay-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/HelveticaNowDisplay-Bold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/HelveticaNowDisplay-ExtraBold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/HelveticaNowDisplay-Black.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../fonts/HelveticaNowDisplay-ExtraBlack.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-helvetica",
});

const georgia = localFont({
  src: [
    {
      path: "../fonts/GeorgiaPro-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/GeorgiaPro-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../fonts/GeorgiaPro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/GeorgiaPro-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/GeorgiaPro-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/GeorgiaPro-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/GeorgiaPro-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../fonts/GeorgiaPro-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../fonts/GeorgiaPro-BlackItalic.ttf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-georgia",
});

export const metadata: Metadata = {
  title: "Perfect Pitch Trainer",
  description: "Learn perfect pitch through interactive quizzes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={clsx(georgia.variable, helveticaNowDisplay.variable)}>
        <Header />
        <div className="mt-16 md:mt-0 pb-10">{children}</div>
      </body>
    </html>
  );
}
