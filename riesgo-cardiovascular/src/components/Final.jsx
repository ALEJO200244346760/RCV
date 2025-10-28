import React from "react";

const Final = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-6">
      <img
        src="/logorosa.png"
        alt="Logo Octubre Rosa"
        className="w-64 mb-8"
      />
      <p className="text-xl text-gray-800 max-w-lg">
        Recuerda que en el <span className="font-semibold text-pink-600">"Octubre Rosa"</span> además de tu chequeo ginecológico realiza tu control de <span className="font-semibold text-pink-600">"Salud Cardiovascular"</span>.
      </p>
      <p className="mt-6 text-lg text-gray-700">
        Muchas gracias por haber participado, ¡Saludos!
      </p>
    </div>
  );
};

export default Final;
