import React from 'react';

const FaqPage: React.FC = () => {
  const faqs = [
    {
      question: "¿Qué es Desafío Azul?",
      answer: "Es una plataforma online que ofrece test psicotécnicos para entrenar habilidades cognitivas y mejorar el rendimiento en exámenes oficiales. De esta manera, te permite entrenar y perfeccionar tus habilidades en test psicotécnicos, ayudándote a conseguir tu plaza en la oposición."
    },
    {
      question: "¿Cómo funciona la plataforma?",
      answer: "Solo debes elegir a qué plan Premium quieres suscribirte, registrarte y comenzar a practicar. Puedes elegir el tipo de test que deseas realizar, si por preguntas sueltas o test cronometrados,  guardar las preguntas desees y revisar tus errores con explicaciones detalladas, entre otras."
    },
    {
      question: "¿Puedo acceder desde cualquier dispositivo?",
      answer: "Sí, nuestra plataforma es compatible con ordenadores, tablets y móviles."
    },
    {
      question: "¿Los test son similares a los oficiales?",
      answer: "Sí, están diseñados para simular las pruebas reales de oposiciones y otros procesos selectivos."
    },
    {
      question: "¿Se actualizan las preguntas?",
      answer: "Si, mantenemos actualizadas todas las preguntas a la vez que incorporamos nuevas preguntas cada mes."
    },
    {
      question: "¿Se guarda mi progreso?",
      answer: "Sí, puedes acceder a tu historial de test y revisar tu evolución en cualquier momento."
    },
    {
      question: "¿Hay test adaptativos?",
      answer: "Sí, la plataforma te permite ajustar los test al número de preguntas que desees así como de las áreas que necesites mejorar para un aprendizaje más personalizado."
    },
    {
      question: "¿Cuánto cuesta el acceso a la plataforma?",
      answer: "Ofrecemos diferentes planes de suscripción. Consulta nuestra sección de precios para más detalles."
    },
    {
      question: "Si me suscribo al Plan Premium, ¿puedo darme de baja en cualquier momento?",
      answer: "En Desafío Azul no tenemos permanencia de ningun tipo, si te das de alta y al mes siguiente no quieres seguir suscrito, puedes darte de baja sin problema; simplemente cancela la suscripción unos días antes de que empiece el siguiente periodo de facturación en el apartado Gestionar mi suscripción dentro de Mi cuenta."
    },
    {
      question: "¿Cómo puedo contactar con soporte?",
      answer: "Puedes escribirnos a [correo de soporte] o utilizar el chat de atención al cliente dentro de la plataforma."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 text-text-primary dark:text-white">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary dark:text-primary mb-8 text-center">
        Preguntas Frecuentes (FAQ)
      </h1>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="card p-5 sm:p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <h3 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-3">
              {index + 1}. {faq.question}
            </h3>
            <p className="text-base text-text-secondary dark:text-gray-400 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqPage; 