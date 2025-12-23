import '../globals.css';

export default function MockLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <body>
                <div className="min-h-screen bg-gray-50">
                    {children}
                </div>
            </body>
        </html>
    );
}