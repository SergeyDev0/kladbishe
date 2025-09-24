import type { Metadata } from "next";
import {Roboto } from "next/font/google";
import "./globals.scss";

const roboto = Roboto({
  variable: "--roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Пом-ни.рф",
  description: "Социальный проект по поиску захоронений и уходу за ними",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={roboto.variable}>
        {children}
      </body>
    </html>
  );
}
