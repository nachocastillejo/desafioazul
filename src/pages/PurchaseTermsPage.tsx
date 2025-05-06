import React from 'react';

const PurchaseTermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 text-text-primary dark:text-white">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary dark:text-primary mb-8 text-center">
        TÉRMINOS Y CONDICIONES GENERALES DE COMPRA
      </h1>

      <section className="mb-8">
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Por favor, le invitamos a revisar los Términos y condiciones generales de compra online que regulan la oferta y compra de productos o servicios a través de nuestra plataforma online.
        </p>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Al usar esta plataforma y realizar cualquier proceso de compra queda vinculado a los presentes Términos y condiciones generales de compra, por lo que le recomendamos que las lea detenidamente. Si no está de acuerdo con las mismas, deberá abstenerse de realizar cualquier compra de productos o servicios en esta plataforma.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-4">
          Prestador del servicio
        </h2>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico, los datos identificativos del titular del Portal Web son:
        </p>
        {/* TODO: Add specific details for the service provider if available */}
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-4">
          Descripción
        </h2>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          DESAFÍO AZUL a través de los presentes Términos y condiciones generales de compra ofrece a sus usuarios y visitantes la posibilidad de realizar la compra online de los productos y servicios ofertados, además de establecer comunicación con el Usuario.
        </p>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          DESAFÍO AZUL. desarrollará su actividad e-commerce como tienda virtual a través de la página web ……. Esta plataforma electrónica dispone de una Suscripción premium a la plataforma de formación online.
        </p>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          La comercialización de los productos y servicios incluidos en las anteriores líneas de negocio se rige a través de los siguientes Términos y condiciones generales de compra.
        </p>
        <p className="text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          DESAFÍO AZUL. podrá alterar en cualquier momento y sin aviso previo, el diseño, presentación y/o configuración del Portal Web, así como algunos o todos los servicios.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-4">
          Aceptación de las condiciones particulares de compra
        </h2>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          El acceso y la utilización de los servicios ofrecidos por … S.L. implican por parte del Usuario la aceptación plena y sin reservas de todas las condiciones recogidas en los presentes Términos y condiciones generales de compra. Asimismo, DESAFÍO AZUL se reserva en todo caso el derecho unilateral de modificar los presentes Términos y condiciones generales de compra.
        </p>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Todo pedido efectuado a DESAFÍO AZUL implica necesariamente a título de condición esencial, determinante e imprescindible, la aceptación sin reservas por el cliente de los Términos y condiciones generales de compra de sus productos, vigentes el día en que se lleve a cabo el pedido correspondiente. Además, el cliente reconoce que la aceptación de los presentes Términos y condiciones generales de compra implicará la aplicación de éstas al pedido al que se refieren, así como a todo pedido posterior, con excepción de aquellos casos en que nuevas condiciones sean puestas en su conocimiento por DESAFÍO AZUL.
        </p>
        <p className="text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          El hecho de que  DESAFÍO AZUL no recurra en un momento dado a cualquiera de las presentes condiciones no puede ser interpretado ni equivaldrá a renunciar a recurrir a ellas en el pasado o el futuro.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-4">
          Categorías de productos
        </h2>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Los productos y servicios ofertados por DESAFÍO AZUL. se encuentran agrupados en las siguientes categorías:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          <li>Suscripción ASPIRANTE a la plataforma de formación online (modalidad de pago MENSUAL)</li>
          <li>Suscripción PRO a la plataforma de formación online (modalidad de pago SEMESTRAL)</li>
          <li>Suscripción ÉLITE  a la plataforma de formación online (modalidad de pago ANUAL)</li>
        </ul>
        <p className="text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Una vez finalizado el proceso de selección del producto o servicio, a través del botón "Suscribirse" o "Comprar", el visitante podrá terminar el proceso de compra y proceder a su pago.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-4">
          Compra
        </h2>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Para poder comprar, el Usuario debe registrarse en nuestra plataforma online, dándose de alta a través del proceso de registro de usuario.
        </p>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Al realizar el proceso de compra, a través de nuestro proveedor de servicios de pago seguro, Stripe, el Usuario deberá cumplimentar el formulario requerido, facilitando los siguientes datos:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          <li>Nombre y Apellidos</li>
          <li>Correo electrónico</li>
          <li>Datos de pago</li>
          <li>Dirección de facturación</li>
        </ul>
        <p className="text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          DESAFÍO AZUL propone diversos medios de pago para que el cliente pueda elegir aquel que más le convenga o se adapte mejor a sus necesidades:
        </p>
        <p className="mt-2 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Pago mediante tarjeta de crédito Visa, Mastercard, American Express, Discover, y otros procesadores de pagos con tarjeta, que han desarrollado un sistema para realizar de forma segura pagos en Internet. El sistema de Comercio Electrónico Seguro se basa en que el Emisor de la tarjeta identifique al titular de la misma antes de autorizar el pago por Internet. SEAL FORMACIÓN Y ESTUDIOS, S.L. se reserva el derecho a rechazar cualquier operación realizada con tarjeta de crédito. En este caso procederemos a reintegrar el efectivo en la tarjeta original. En estos casos y si el cliente está interesado en progresar en la compra de los artículos solicitaremos una transferencia bancaria.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-4">
          Precios
        </h2>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          El precio de los productos o servicios ofertados se expresan en EUROS (€) e incluyen el IVA. Durante el proceso de compra aparecerá desglosado el importe correspondiente a la carga impositiva acorde al tipo vigente en cada momento y aplicable a los productos y/o servicios comercializados, así como los correspondientes gastos de envío desglosados antes de la confirmación del pedido.
        </p>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Las ofertas estarán debidamente marcadas e identificadas como tales, indicando convenientemente el precio anterior y el precio de la oferta.
        </p>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          DESAFÍO AZUL se reserva el derecho a efectuar, en cualquier momento y sin previo aviso, las modificaciones que considere oportunas, pudiendo actualizar diariamente productos y servicios en función del mercado.
        </p>
        <p className="text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          En el caso de producirse una variación de precio, DESAFÍO AZUL comunicará por medio de correo electrónico al cliente la variación y el cliente podrá optar por anular su pedido sin que se le pueda imputar ningún coste adicional.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-4">
          Impago
        </h2>
        <p className="text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Llegado el vencimiento pactado para la entrega del producto o del servicio, en caso de impago total o parcial por parte del cliente, DESAFÍO AZUL podrá suspender o cancelar cualquier producto o servicio, sin incurrir en responsabilidad por cualesquiera daños o pérdidas, incluido el lucro cesante, o daños por retraso o pérdida de producción ocasionados al cliente. La anterior facultad de DESAFÍO AZUL., en ningún caso, liberará al cliente de sus obligaciones contractuales con relación a los pagos adeudados y a la recepción de los productos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-4">
          ANULACIÓN
        </h2>
        <p className="text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Los Usuarios que quieran anular alguno de los servicios contratados online, como la suscripción premium a la plataforma de formación online, podrán hacerlo en cualquier momento, sin necesidad de justificación, a través del Portal Web. La anulación del servicio debe realizarse antes de que se produzca el siguiente cargo. En caso de que el Usuario haya realizado el pago del servicio y no haya cancelado la misma, DESAFÍO AZUL no procederá al reembolso del importe pagado.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-4">
          Derecho de desistimiento y servicios no sujetos al derecho de desistimiento
        </h2>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Será de aplicación el apartado m) del artículo 103 del Real Decreto Legislativo 1/2007, de 16 de noviembre, por el que se aprueba el texto refundido de la Ley General para la Defensa de los Consumidores y Usuarios y otras leyes complementarias.
        </p>
        <p className="mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          El derecho de desistimiento no será aplicable a los contratos que se refieran a:
        </p>
        <p className="mb-2 ml-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          m) El suministro de contenido digital que no se preste en un soporte material cuando la ejecución haya comenzado y, si el contrato impone al consumidor o usuario una obligación de pago, cuando se den las siguientes condiciones:
        </p>
        <ul className="list-disc list-inside ml-8 space-y-2 mb-4 text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          <li>El consumidor o usuario haya otorgado su consentimiento previo para iniciar la ejecución durante el plazo del derecho de desistimiento.</li>
          <li>El consumidor o usuario haya expresado su conocimiento de que, en consecuencia, pierde su derecho de desistimiento; y</li>
          <li>El empresario haya proporcionado una confirmación con arreglo al artículo 98.7 o al artículo 99.2.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-4">
          Soporte técnico y servicio de atención al cliente
        </h2>
        <p className="text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Si tienes algún problema, por favor ponte en contacto con nosotros para solucionarlo en la siguiente dirección de correo electrónico:
        </p>
         {/* TODO: Add support email if available */}
      </section>

      <section className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-4">
          Propiedad industrial e intelectual
        </h2>
        <p className="text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          Los derechos de propiedad intelectual e industrial sobre las obras, marcas, logos, y cualquier otro susceptible de protección, contenidos en el Portal Web le corresponden en exclusiva a DESAFÍO AZUL y/o terceros que hayan permitido su uso. 
        </p>
        <p className="text-base text-text-secondary dark:text-gray-400 leading-relaxed">
          La reproducción, distribución, comercialización o transformación no autorizadas de tales obras, marcas, logos, etc. constituye una infracción de los derechos de propiedad intelectual e industrial de DESAFÍO AZUL o del titular de los mismos, y podrá dar lugar al ejercicio de cuantas acciones judiciales o extrajudiciales les pudieran corresponder en el ejercicio de sus derechos.
        </p>
      </section>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-10 text-center">
        Fecha de última actualización: [Fecha]
      </p>
    </div>
  );
};

export default PurchaseTermsPage; 