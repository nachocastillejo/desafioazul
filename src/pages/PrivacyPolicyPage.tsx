import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 text-text-primary dark:text-white">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary dark:text-primary mb-8 text-center">
        POLÍTICA DE PRIVACIDAD
      </h1>

      <section className="mb-8">
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          En DESAFÍO AZUL respetamos y protegemos tu privacidad. Recopilamos datos personales únicamente con tu consentimiento y para proporcionarte nuestros servicios. Los datos recopilados incluyen información de registro, actividad en la plataforma y detalles de pago. Utilizamos esta información para mejorar tu experiencia, gestionar tus solicitudes y cumplir con obligaciones legales.
        </p>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          De acuerdo con la normativa de protección de datos de carácter personal, y en conformidad con lo previsto en el Reglamento (UE) 2016/679 del parlamento europeo y del consejo de 27 de abril de 2016 relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales y a la libre circulación de estos datos, mediante la presente Política de privacidad el Usuario queda informado de lo siguiente:
        </p>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          [Nombre de la plataforma] (en adelante, "la Plataforma") es una página web de titularidad de [Nombre de la Empresa o Titular], con domicilio en [Dirección de la Empresa], y con número de identificación fiscal [NIF/CIF].
        </p>
        <p className="text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Correo electrónico de contacto: [Correo electrónico]
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-4">
          Usuarios
        </h2>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Sus datos personales serán tratados con la finalidad de:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          <li>Gestionar el alta en el área de registro de usuario y su acceso a la aplicación.</li>
          <li>Gestión de la tarifa contratada y métodos de pago.</li>
          <li>Proporcionar, personalizar y mejorar tu experiencia con la Aplicación y con el servicio puesto a tu disposición a través de esta.</li>
          <li>Recibir sus comentarios e incidencias del servicio.</li>
          <li>Garantizar el funcionamiento técnico de la Aplicación, desarrollar nuevos servicios y analizar el uso de esta, incluida su interacción con aplicaciones y servicios puestos a su disposición.</li>
          <li>Realizar análisis estadísticos de uso de la Aplicación. Los datos estadísticos se tratarán para esta finalidad previa disociación de los datos, de tal forma que ninguna personal sea identificada o identificable a partir de los mismos, limitándose a analizar la actividad de los usuarios y su frecuencia de utilización de la Aplicación (ej: solicitamos datos de género para fines meramente estadísticos).</li>
          <li>Aplicar esta política de privacidad, los términos y las condiciones de uso.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-4">
          Permisos
        </h2>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Para prestar estos servicios, se requiere conexión a Internet y los siguientes permisos para acceder al teléfono:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          <li>Redes Wi-Fi: Para obtener y actualizar la conexión a Internet.</li>
          <li>Datos técnicos que podrán incluir su dirección IP, la identificación única de su dispositivo, la información operacional que posibilita la interactuación con los servicios de la Aplicación, su sistema operativo y la versión de nuestra Aplicación que tu utiliza.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-4">
          ¿Durante cuánto tiempo mantenemos sus datos personales?
        </h2>
        <ul className="list-disc list-inside space-y-2 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          <li>Los datos personales serán mantenidos mientras siga vinculado con nosotros.</li>
          <li>Una vez se desvincule, los datos personales tratados en cada finalidad se mantendrán durante los plazos legalmente previstos, incluido el plazo en el que un juez o tribunal los pueda requerir atendiendo al plazo de prescripción de acciones judiciales.</li>
          <li>Los datos tratados se mantendrán en tanto no expiren los plazos legales aludidos anteriormente, si hubiera obligación legal de mantenimiento, o de no existir ese plazo legal, hasta que el interesado solicite su supresión o revoque el consentimiento otorgado.</li>
          <li>Mantendremos toda la información y comunicaciones relativas a su compra o a la prestación de nuestro servicio, mientras duren las garantías de los productos o servicios, para atender posibles reclamaciones.</li>
        </ul>
      </section>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-10 text-center">
        Fecha de última actualización: [Fecha]
      </p>
    </div>
  );
};

export default PrivacyPolicyPage; 