// Public rulebook and creative prompts. No player secrets or credentials live here.
export const ROLES = {
  victory: { name: 'Puerta victoriosa', icon: '☀', description: 'Inventa un escenario y un arma con los que sea razonable vencer. Tu enemigo debe respetar esa intención.' },
  mortal: { name: 'Puerta mortal', icon: '☠', description: 'Inventa una combinación difícil o casi imposible de superar. Después asignarás un enemigo acorde con esta intención.' },
  free: { name: 'Puerta libre', icon: '?', description: 'Tú decides: una oportunidad, una trampa o algo completamente inesperado.' },
};
export const CARDS = {
  life: { name: 'Vida extra', icon: '♥', window: 'reward', description: 'Si sigues vivo al terminar los combates, ganas una vida de inmediato. Puedes superar las tres vidas iniciales.' },
  weapon: { name: 'Cambio de arma', icon: '✦', window: 'preparation', description: 'Cambia el arma de cualquier jugador, incluido tú, por otra que inventes. Antes de revelar todos los enemigos.' },
  swap: { name: 'Intercambio de armas', icon: '⇄', window: 'preparation', description: 'Intercambia las armas de dos jugadores. No puedes haber espiado ni visto sus enemigos.' },
  ownSwap: { name: 'Intercambio de arma propia', icon: '⇆', window: 'preparation', description: 'Intercambia tu arma con la de otro jugador antes de la revelación.' },
  enemy: { name: 'Cambio de enemigo', icon: '☄', window: 'revealed', description: 'Inventa un enemigo completamente diferente para otro jugador. No puedes usarla sobre ti mismo.' },
  double: { name: 'Duplicador de enemigo', icon: 'Ⅱ', window: 'revealed', description: 'Otro jugador se enfrenta dos veces a su enemigo. Debe superar las dos votaciones para no perder una vida.' },
  reflect: { name: 'Reflejar habilidad', icon: '◇', window: 'reaction', description: 'Cuando una habilidad te apunta, redirígela al atacante o a otro jugador. Caduca al terminar la ronda en que puedes usarla.' },
  random: { name: 'Reasignar enemigo al azar', icon: '⚄', window: 'revealed', description: 'Escoge un objetivo. La sala sortea a una tercera persona para que invente su nuevo enemigo.' },
  spy: { name: 'Espía', icon: '◉', window: 'preparation', extraWindow: 'sealed', description: 'Consulta en privado el rol o arma de un jugador después de elegir puertas; también su enemigo cuando ya esté sellado. La información no se comparte con la sala.' },
  mutate: { name: 'Mutación del arma', icon: '⌁', window: 'revealed', description: 'Propón una mejora creativa de tu arma y justifícala. El grupo debe aprobarla por mayoría antes del combate.' },
  interrupt: { name: 'Interrupción de habilidad', icon: '⊘', window: 'reaction', description: 'Cancela una habilidad pendiente. Tiene prioridad máxima, incluso sobre un reflejo que aún esté esperando resolución.' },
  bait: { name: 'Cebo', icon: '⚑', window: 'sealed', description: 'Obliga a otro jugador a mostrar su enemigo antes de la revelación general.' },
};
export const PHASES = {
  lobby: 'Sala de espera', crafting: 'Inventar puertas', choosing: 'Elegir puerta', assigning: 'Enemigos secretos',
  preparation: 'Preparar las armas', sealed: 'Antes de abrir', revealed: 'Enemigos revelados', combat: 'El veredicto', results: 'Final de ronda', finished: 'Partida terminada', cancelled: 'Sala cerrada',
};
export const ARENAS = [
  'Un supermercado sin gravedad', 'Un castillo de hielo durante una tormenta', 'La cocina de un restaurante en hora punta',
  'Un vagón de metro lleno de espejos', 'La cubierta de un barco pirata', 'Una biblioteca donde cada ruido despierta a las estatuas',
  'Una estación espacial con las luces apagadas', 'Una azotea durante un apagón', 'Un bosque de setas gigantes',
  'Una fábrica de juguetes abandonada', 'Un ascensor que no deja de subir', 'Una piscina llena de gelatina',
  'Un laboratorio con portales inestables', 'Una plaza invadida por robots de limpieza', 'Un teatro donde el suelo gira',
  'Un desierto de cristal', 'Un museo de dinosaurios a medianoche', 'Un gimnasio sobre una plataforma flotante',
  'Una oficina donde la gravedad cambia cada minuto', 'Un estadio con el césped convertido en lava', 'Un tren en miniatura donde tú también eres diminuto',
  'Un hangar de drones averiados', 'Una ciudad construida sobre las nubes', 'Un mercado medieval durante un concurso de magia',
];
export const WEAPONS = [
  'Una sartén indestructible', 'Un paraguas que desvía proyectiles', 'Una cuchara de madera', 'Una grapadora industrial',
  'Una espada de espuma', 'Un dron con una pinza', 'Un lanzador de confeti cegador', 'Un escudo magnético',
  'Un guante que congela lo que toca', 'Una cuerda de veinte metros', 'Un extintor casi vacío', 'Un patinete supersónico',
  'Una linterna que revela puntos débiles', 'Un martillo de goma', 'Un arco con tres flechas', 'Una aspiradora portátil',
  'Un libro de hechizos con una página legible', 'Un tirachinas con canicas', 'Un traje de camuflaje reflectante', 'Un trombón ensordecedor',
  'Un imán del tamaño de una mochila', 'Una red de pesca reforzada', 'Una pistola de agua a presión', 'Un tenedor telescópico',
];
export const ENEMIES = [
  'Un caballero que solo puede moverse hacia atrás', 'Un pulpo mecánico con ocho escudos', 'Un dragón alérgico al humo',
  'Un robot que copia tus movimientos con dos segundos de retraso', 'Una bandada de palomas del tamaño de motocicletas',
  'Un ninja que solo aparece en los reflejos', 'Un oso con armadura de cartón', 'Un gigante que teme los ruidos fuertes',
  'Un mago que convierte metal en gominolas', 'Tres esqueletos que discuten entre sí', 'Un enjambre de drones desorientados',
  'Un cocodrilo que puede caminar por las paredes', 'Un detective invisible que deja huellas luminosas', 'Una estatua de piedra que se mueve al parpadear',
  'Un alienígena que se alimenta de luz', 'Un golem hecho de electrodomésticos', 'Un pirata que controla las corrientes de aire',
  'Un velocirráptor con botas de patinaje', 'Un samurái que conoce tu siguiente movimiento', 'Un espejo que devuelve todos tus ataques',
  'Un gladiador con una sola mano y un escudo enorme', 'Un fantasma que solo puede tocar objetos azules', 'Una planta carnívora que sigue los sonidos',
  'Un chef colosal que usa dos tapas como escudos',
];
export function suggestion(kind, random = Math.random) {
  const pick = list => list[Math.floor(random() * list.length)];
  return kind === 'enemy' ? pick(ENEMIES) : { scenario: pick(ARENAS), weapon: pick(WEAPONS) };
}
