/*
  # Seed Questions Data
  
  This migration populates the questions table with initial test data
  from the existing test_questions.js file.
*/

-- Insert psicotécnico questions
INSERT INTO questions (test_type, category, topic, text, options, correct_option, explanation)
VALUES
  (
    'psicotecnico',
    'Razonamiento numérico',
    'Todas las categorías',
    'Si un trabajador gana 12 € por hora y trabaja 7 horas al día durante 5 días a la semana, ¿cuál es su sueldo semanal?',
    ARRAY['84 €', '420 €', '12 €', '588 €'],
    2,
    'Se multiplica la tarifa horaria (12 €) por las horas diarias (7) y por los días a la semana (5): 12 × 7 × 5 = 420 €.'
  ),
  (
    'psicotecnico',
    'Razonamiento verbal',
    'Todas las categorías',
    'Encuentra el antónimo más adecuado de la palabra ''optimista''.',
    ARRAY['Alegre', 'Pesimista', 'Seguro', 'Despreocupado'],
    2,
    'El antónimo de ''optimista'' es ''pesimista'', ya que describe la visión negativa frente a los hechos.'
  ),
  (
    'psicotecnico',
    'Razonamiento espacial',
    'Todas las categorías',
    'Imagina un cubo que se rota 90° en el eje vertical. ¿Cuál de las siguientes afirmaciones describe mejor el cambio de su orientación?',
    ARRAY['El cubo mantiene la misma posición de sus caras', 'Las caras laterales cambian de posición entre sí', 'Solo la cara superior cambia de lugar con la inferior', 'No hay cambio alguno en su estructura'],
    2,
    'Un giro de 90° en el eje vertical intercambia las caras laterales, manteniendo la cara superior e inferior en la misma posición.'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert teoría questions
INSERT INTO questions (test_type, category, topic, text, options, correct_option, explanation)
VALUES
  (
    'teoria',
    'El Derecho',
    'Ciencias Jurídicas',
    '¿Qué es el Derecho y cuál es su función en la sociedad?',
    ARRAY['Un conjunto de normas sin aplicación práctica', 'Una ciencia que regula la convivencia social mediante normas', 'Una rama del conocimiento sin implicaciones éticas', 'Una práctica exclusiva del Estado'],
    2,
    'El Derecho es un conjunto de normas que regulan la convivencia social y establecen derechos y obligaciones.'
  ),
  (
    'teoria',
    'La Constitución Española (I)',
    'Ciencias Jurídicas',
    '¿Cuál es el papel de la Constitución Española en el ordenamiento jurídico?',
    ARRAY['Es una ley ordinaria entre muchas', 'Establece los principios y derechos fundamentales', 'Es un documento histórico sin efecto actual', 'Solo regula cuestiones administrativas'],
    2,
    'La Constitución Española establece los principios fundamentales y organiza el Estado, siendo la norma suprema.'
  ),
  (
    'teoria',
    'La Constitución Española (II)',
    'Ciencias Jurídicas',
    '¿Qué reformas importantes se han llevado a cabo en la Constitución Española desde su aprobación?',
    ARRAY['Ha sido reformada para incorporar la democracia moderna', 'Solo se ha modificado en cuestiones simbólicas', 'No ha sufrido ninguna reforma', 'Se reformó para eliminar derechos fundamentales'],
    1,
    'La Constitución ha sido objeto de reformas que la han adaptado a la realidad democrática y a las exigencias de la sociedad actual.'
  )
ON CONFLICT (id) DO NOTHING;