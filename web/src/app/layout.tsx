export const metadata = {
  title: "Miraj CV",
  description: "AI-assisted job application tailoring",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
