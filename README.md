# ERA2 — Очередь генераций

Реализован экран «Очередь генераций» для агрегатора нейросетей ERA2: живой мок-движок с лимитом параллелизма (MAX_CONCURRENT = 2), тиками прогресса и случайными сбоями (~15%), фильтрация по статусу, сортировка, поиск с debounce, адаптивная вёрстка (строки на desktop, карточки на mobile), глобальный плавающий статус-бар генераций, персистентность через localStorage с восстановлением running-задач в queued и undo-удаление завершённых. Архитектура — Feature-Sliced Design: `entities/generation-task` → `features/generation-queue` (reducer + engine + selectors + UI) → `widgets/generation-queue` → `pages/QueuePage`; стейт — `useReducer` + Context, движок диспатчит actions в React-состояние. Шрифт — Geist / Geist Mono (`@fontsource-variable`), иконки — lucide-react, анимации — framer-motion.

**Лайвкод + транскрипция видео:** https://disk.yandex.ru/d/PmEZabsm97TlhA

Транскрипция лежит рядом с записью — можно скормить в нейронку для анализа.
