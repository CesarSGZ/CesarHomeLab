# Plan: modelo térmico final de la Terra (CFD + dinámico)

Estado: PREPARADO, esperando luz verde de César (21 nov 2026). Cuando la dé, se sigue sin parar hasta cerrar.
Fuera de alcance: undervolt de CPU y GPU (César no lo va a hacer de momento).

## Lo que ya está preparado
- `tools/thermal-bench/wide.py`: S01–S07 pasadas a tablas de 1 Hz (`sesiones/<id>/wide_1hz.csv`, sin huecos de HWiNFO).
- Tiempos medidos: un caso de 2,5 mm tarda ~10–11 min; uno de 4 mm, ~3–4 min. Una campaña completa de 7 casos, ~1 h 20 min.
- Lo que dicen ya los datos (régimen, últimos 3 min de cada fase):
  - La gráfica se queda en 300 W (su límite) y su ventilador compensa: 2058 rpm sin canales (S04) → 1971 con canales (S07).
    Su curva es clara: ~1,6 % de ventilador por °C entre 73 y 79 °C.
  - El procesador vive pegado a Tctl ≈ 86 °C y lo que cambia es la potencia que aguanta: 88 W (S04), 105 W (S06), 92 W (S07).
  - La curva del ventilador del procesador sale ~10 % más baja con canal a igual Tctl (S07 frente a S04). Hay que mirar si es
    el canal cargando el ventilador o un cambio en la BIOS.
  - Por eso, para comparar montajes, lo honesto es: gráfica → °C y rpm (ruido); procesador → vatios que aguanta (rendimiento) y °C de núcleos.

## Bloque A. Modelo dinámico acoplado (no ocupa el PC)
A1. Curvas y límites: ventilador de gráfica = f(T), ventilador de procesador = f(Tctl), límite de 300 W y de Tctl 86 °C.
A2. Red física de 3–4 nodos: gráfica (unión + disipador), procesador (núcleos + disipador) y aire compartido de la caja.
    Entradas: vatios medidos, rpm y ambiente. Las conductancias de los disipadores escalan con rpm^0,7 (la misma ley que el CFD).
A3. Ajuste con S04 y S07 (los dos extremos). A ciegas: trazas completas de 71 min de S05 y S06.
    Aprobado si: error típico ≤ 1,5 °C en gráfica y procesador, ≤ 1 °C en régimen, y sin el sesgo de −3 °C en carga combinada que tumbó el de agosto.
    Si falla el procesador: salida = media de núcleos y Tctl = núcleos + desfase que crece con la potencia.
    Si falla el acoplamiento: se fija con los coeficientes del CFD (B1).
A4. Puente con el CFD: las ganancias en régimen del modelo dinámico salen del CFD para cada montaje; así el dinámico vale para
    cualquier montaje que el CFD haya simulado, con curvas de ventilador y límites incluidos (bucle cerrado).

## Bloque B. CFD más robusto (ocupa el PC, de uno en uno)
B1. Acoplamiento: S07 a 4 mm solo con el calor de la gráfica y solo con el del procesador. Comparar con las fases medidas
    (cuánto sube el procesador con solo la gráfica cargada, y al revés). ~10 min.
B2. Punto flojo (gráfica sin canal, el CFD le devuelve demasiado aire caliente): hipótesis en criba de 4 mm sobre S04/S05/S06 (+S07 de control):
    a) reparto de la salida de las aletas de la gráfica (pasante frente a laterales);
    b) giro del aire de sus ventiladores;
    c) malla fina en el hueco de 15 mm hasta el panel;
    d) reparto del calor entre placa de la gráfica y backplate.
    Solo se acepta lo que mejore S04/S05/S06 sin empeorar S07. Cada criba ~15–25 min.
B3. Si algo pasa la criba: campaña de 2,5 mm completa otra vez (~1 h 20 min) y nuevas validaciones.
B4. Incertidumbre de malla: S07 en 2,0 mm (~30 min) para dar el error numérico (4 / 2,5 / 2,0 mm) junto al error de validación.

## Bloque C. Qué cambiar (con el modelo final, en bucle cerrado)
- Sentido de los ventiladores de caja: las 4 combinaciones (ya hechas) recalculadas con el modelo final.
- Velocidad de los ventiladores de caja: abajo y arriba a ~800 / actual / ~1500 rpm / máximo.
- Curva del ventilador del procesador más alegre (cuántos vatios gana y cuánto ruido).
- Segundo ventilador empujando en el canal del procesador (CFG-050).
- Gráfica a 270–280 W (cuánto baja temperatura y ruido).
- Salida por montaje: °C de cada pieza, rpm de gráfica y procesador, vatios que aguanta el procesador. Regla: recomendar solo si gana > 1 °C o > 3 W sin empeorar otra pieza más de 1 °C.

## Bloque D. Web
- "Which models can be trusted": entrada del CFD (aceptado), modelo dinámico nuevo con su veredicto honesto y los de agosto como históricos.
  Gráficas medido frente a predicho de las trazas de 71 min a ciegas.
- Panel "¿Y si…?" en Mission Control: eliges sentido y velocidad de ventiladores y otras opciones, y ves lo que predice el modelo (casos precalculados).
- Recomendación final ordenada, KPIs del CV y borrador de Reddit (sin publicar).

## Orden
B1 lanzado → mientras corre, A1–A3 → B2 (cribas de una en una) → B3/B4 si toca → A4 → C (casos de 2,5 mm de uno en uno) → D → PR y fusión.

## Diario (21 nov, luz verde 17:20)
- Fases sueltas con arranque en caliente (`run_case.py --warm`, `phases.py`): ~21 min por caso. Cola: fases → escenarios (`whatif.py --run`) → malla 2 mm (`screen.py malla2 --cell 2.0 --cases S04,S07`).
- Modelo dinámico (`thermal-bench/dynmodel.py`, `dynfit.py`): numba, arranque desde lo medido; con aire libre por sesión 0,8-0,9 °C gráfica y 1,1-1,3 °C procesador.
- Ventilador de gráfica: curva ~38,5 rpm/°C por debajo de 78 °C y objetivo de 78 °C por encima (S01-S05 clavadas en 78). `whatif.py` cierra el bucle.
- Repetibilidad S01-S03 (mismo montaje): procesador 76,7-79,9 °C (potencia 81-85 W) → suelo de ~1,5 °C para el procesador.
- S07 solo gráfica: gráfica −2,1 (igual que combinada), procesador +2,9 (potencia del SoC no calienta núcleos), VRM +4,6.
- Protocolo nuevo (`model4.py`): calibrar con las 3 fases de la S04 (2 constantes por pieza: fija + ∝ potencia; procesador con núcleos frente a SoC), y S05, S06, S07 completas a ciegas.
- Hipótesis descartada: aire detrás de la gráfica (`probe_zones.py`) no explica la S06.
- Hipótesis descartada: aire de fuera que vuelve a entrar (`room.py`, 4 mm, EXT 36 frente a 100 mm): la entrada del procesador no cambia (19,4-19,5 °C).
- Canal del procesador: dos constantes (λ, μ) para todo el lado de la placa, cruzadas S06 ↔ S07; final con las dos (`final_eval.py` → `regimen.json`).
- Resultado en régimen: 51 comparaciones a ciegas, rms 1,47 °C, máx 3,2 °C, 78 % dentro de ±2 °C (calibración S04: 0,58).
- Dinámico ajustado con la S04 (`dinamico.json`): gráfica 0,93 / 1,10 / 2,69 / 2,40 °C y procesador 1,06 / 2,13 / 0,87 / 1,20 °C (S04 / S05 / S06 / S07).

## Diario (22 nov)
- Escenarios (12) terminados a las 00:45. Con los dos canales la gráfica y el procesador respiran a 19,0 °C en todos: los ventiladores de caja solo tocan placa y memoria.
  Veredictos (regla fijada antes): merece la pena push-pull (−2,6), ventilador del procesador a tope (−1,8) y gráfica a 280 W (−2,1); ningún cambio de sentido.
  Añadido el veredicto «igual y más silencioso» (baja vueltas de un ventilador de caja y nada sube más de 0,5 °C): arriba a 1.500 rpm (≤ +0,2 °C, ~8 dB menos).
- Segunda tanda en cola tras la malla: arriba parado, silencioso (1.200 / 900) y la mejor combinación (push-pull + arriba 1.500).
- Malla de 2 mm: la cadena del 21 falló (argumentos de `screen.py` después del nombre); relanzada a las 00:46, 2,83 M celdas, ~2,5 s por iteración.
- Gráfica: ¿se arregla eligiendo qué ventiladores definen su aire de entrada? Media simple 2,38 °C a ciegas, ponderada por caudal 2,12, solo ventiladores 1+2 1,32.
  Pero el 1 está sobre el tramo sin placa (flujo pasante, x 30-130 mm) y el chip queda bajo los ventiladores 2-3, que dan 3,45: el «mejor» no tiene base física → descartado. Se queda la media simple; la gráfica sigue en ±3 °C.
