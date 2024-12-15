"use client";

// pages/_error.tsx
interface ErrorPageProps {
  statusCode?: number;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ statusCode }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800 text-center">
      <h1 className="text-4xl font-bold mb-4">
        {statusCode || "Bir Hata Oluştu!"}
      </h1>
      <p className="text-lg mb-6">
        {statusCode
          ? `${statusCode} kodlu bir hata meydana geldi.`
          : "Beklenmeyen bir hata oluştu."}
      </p>
      <a href="/" className="text-blue-500 hover:underline">
        Ana Sayfaya Dön
      </a>
    </div>
  );
};

export default ErrorPage;
