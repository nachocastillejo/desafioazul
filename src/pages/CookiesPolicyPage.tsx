import React from 'react';

const CookiesPolicyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 text-text-primary dark:text-white">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary dark:text-primary mb-8 text-center">
        POLÍTICA DE COOKIES
      </h1>

      <section className="mb-8">
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          En Desafío Azul, utilizamos cookies para mejorar tu experiencia de usuario, personalizar el contenido y analizar el tráfico web. Al navegar por nuestra plataforma, aceptas el uso de cookies de acuerdo con esta Política de Cookies.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-4">
          ¿Qué son las cookies?
        </h2>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, teléfono móvil, tablet, etc.) cuando accedes a una página web. Estos archivos permiten que la web recuerde tus preferencias, acciones y datos durante un periodo de tiempo, facilitando tu navegación en futuras visitas.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-4">
          Tipos de cookies que utilizamos:
        </h2>
        <ol className="list-decimal list-inside space-y-3 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          <li>
            <span className="font-semibold text-text-primary dark:text-white">Cookies esenciales:</span> Son necesarias para el funcionamiento básico de la plataforma, como la autenticación de usuarios, la navegación por las distintas secciones y la seguridad del sitio.
          </li>
          <li>
            <span className="font-semibold text-text-primary dark:text-white">Cookies de rendimiento:</span> Estas cookies nos permiten analizar cómo los usuarios interactúan con la plataforma, ayudándonos a mejorar su rendimiento y usabilidad. Recopilan información de forma anónima sobre las páginas visitadas y el tiempo de permanencia.
          </li>
          <li>
            <span className="font-semibold text-text-primary dark:text-white">Cookies funcionales:</span> Estas cookies permiten recordar tus preferencias y configuraciones, como el idioma o el número de preguntas que eliges en los simulacros, para ofrecerte una experiencia más personalizada.
          </li>
          <li>
            <span className="font-semibold text-text-primary dark:text-white">Cookies de marketing:</span> Estas cookies se utilizan para mostrar anuncios relevantes según tus intereses. También pueden ser utilizadas por terceros para realizar un seguimiento de tu comportamiento en línea y ofrecerte anuncios personalizados.
          </li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-4">
          Cómo gestionar las cookies:
        </h2>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Puedes gestionar o desactivar las cookies en cualquier momento a través de la configuración de tu navegador. Ten en cuenta que desactivar algunas cookies puede afectar la funcionalidad de la plataforma, limitando la experiencia del usuario.
        </p>
        <ul className="list-disc list-inside space-y-2 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          <li>Google Chrome: <a href="https://support.google.com/chrome/answer/95647?hl=es" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Configuración de cookies</a></li>
          <li>Mozilla Firefox: <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Configuración de cookies</a></li>
          <li>Safari: <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Configuración de cookies</a></li>
          <li>Microsoft Edge: <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Configuración de cookies</a></li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-4">
          Actualización de la Política de Cookies:
        </h2>
        <p className="text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Nos reservamos el derecho de modificar esta Política de Cookies en cualquier momento. Cualquier cambio será publicado en esta página, indicando la fecha de la última actualización.
        </p>
      </section>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-10 text-center">
        Fecha de última actualización: [Fecha]
      </p>
    </div>
  );
};

export default CookiesPolicyPage; 