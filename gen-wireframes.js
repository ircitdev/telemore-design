// Генератор wireframe-дизайнов для админки ТЕЛЕМОРЕ
const fs = require('fs');

// ==== Базовые константы ====
const COLORS = {
  bg: '#F5F5F7',
  surface: '#FFFFFF',
  border: '#D0D0D5',
  borderDashed: '#B0B0B5',
  text: '#2C2C2E',
  textSec: '#6C6C72',
  placeholder: '#B0B0B5',
  accent: '#2C2C2E',
  danger: '#B0362C'
};
const FONT = 'Roboto';

// ==== Helpers ====
const id = (() => { let n = 0; return p => `${p}-${++n}`; })();

const text = (content, opts = {}) => ({
  id: id('t'),
  type: 'text',
  content,
  fontFamily: FONT,
  fontSize: opts.size || 13,
  fontWeight: opts.weight || 400,
  fill: [{ type: 'solid', color: opts.color || COLORS.text }],
  width: opts.width,
  textGrowth: opts.growth,
  ...(opts.role ? { role: opts.role } : {})
});

const hdg = (content, size = 18, weight = 700) =>
  text(content, { size, weight, color: COLORS.text });

const sub = (content, size = 11) =>
  text(content, { size, color: COLORS.textSec });

const box = (opts = {}) => ({
  id: id('box'),
  type: 'frame',
  width: opts.w || 'fill_container',
  height: opts.h || 'fit_content',
  layout: opts.layout || 'vertical',
  gap: opts.gap ?? 12,
  padding: opts.padding ?? 16,
  alignItems: opts.alignItems,
  justifyContent: opts.justifyContent,
  fill: [{ type: 'solid', color: opts.bg || COLORS.surface }],
  stroke: { thickness: opts.strokeW || 1, fill: [{ type: 'solid', color: opts.border || COLORS.border }] },
  cornerRadius: opts.radius ?? 6,
  children: opts.children || []
});

const plain = (opts = {}) => ({
  id: id('plain'),
  type: 'frame',
  width: opts.w || 'fill_container',
  height: opts.h || 'fit_content',
  layout: opts.layout || 'vertical',
  gap: opts.gap ?? 8,
  padding: opts.padding ?? 0,
  alignItems: opts.alignItems,
  justifyContent: opts.justifyContent,
  children: opts.children || []
});

const btn = (label, opts = {}) => ({
  id: id('btn'),
  type: 'frame',
  role: 'button',
  width: opts.w || 'fit_content',
  height: opts.h || 36,
  padding: [8, 16],
  layout: 'horizontal',
  alignItems: 'center',
  justifyContent: 'center',
  fill: [{ type: 'solid', color: opts.primary ? COLORS.accent : COLORS.surface }],
  stroke: { thickness: 1, fill: [{ type: 'solid', color: opts.primary ? COLORS.accent : COLORS.border }] },
  cornerRadius: 6,
  children: [text(label, { size: 12, weight: 600, color: opts.primary ? '#FFF' : COLORS.text })]
});

const input = (placeholder, opts = {}) => ({
  id: id('inp'),
  type: 'frame',
  role: 'form-input',
  width: opts.w || 'fill_container',
  height: 36,
  padding: [8, 12],
  layout: 'horizontal',
  alignItems: 'center',
  fill: [{ type: 'solid', color: COLORS.surface }],
  stroke: { thickness: 1, fill: [{ type: 'solid', color: COLORS.border }] },
  cornerRadius: 6,
  children: [text(placeholder, { size: 12, color: COLORS.placeholder })]
});

const placeholder = (label, w, h) => ({
  id: id('ph'),
  type: 'frame',
  width: w,
  height: h,
  layout: 'horizontal',
  alignItems: 'center',
  justifyContent: 'center',
  fill: [{ type: 'solid', color: '#FAFAFC' }],
  stroke: { thickness: 1, fill: [{ type: 'solid', color: COLORS.borderDashed }] },
  cornerRadius: 6,
  children: [text(label, { size: 11, color: COLORS.placeholder })]
});

const divider = () => ({
  id: id('div'),
  type: 'rectangle',
  width: 'fill_container',
  height: 1,
  fill: [{ type: 'solid', color: COLORS.border }]
});

// ==== Sidebar (общий для продюсера) ====
const navItem = (label, active = false) => ({
  id: id('nav'),
  type: 'frame',
  width: 'fill_container',
  height: 36,
  padding: [8, 12],
  layout: 'horizontal',
  alignItems: 'center',
  fill: [{ type: 'solid', color: active ? '#EAEAEE' : '#00000000' }],
  cornerRadius: 6,
  children: [text(label, { size: 13, weight: active ? 600 : 400, color: active ? COLORS.text : COLORS.textSec })]
});

const sidebar = (activeItem = 0) => ({
  id: id('sb'),
  type: 'frame',
  name: 'Sidebar',
  width: 220,
  height: 'fill_container',
  layout: 'vertical',
  gap: 6,
  padding: 16,
  fill: [{ type: 'solid', color: '#FAFAFC' }],
  stroke: { thickness: 0, fill: [{ type: 'solid', color: COLORS.border }] },
  children: [
    plain({
      layout: 'horizontal',
      gap: 8,
      alignItems: 'center',
      padding: [12, 8],
      children: [
        placeholder('LOGO', 28, 28),
        text('ТЕЛЕМОРЕ', { size: 14, weight: 700 })
      ]
    }),
    divider(),
    sub('МЕНЮ'),
    ...['Dashboard', 'Сканер QR', 'Участники', 'События', 'Уведомления', 'План дня']
      .map((l, i) => navItem(l, i === activeItem)),
    divider(),
    sub('АККАУНТ'),
    navItem('Профиль'),
    navItem('Выход')
  ]
});

// ==== Header ====
const header = (breadcrumb, actions = []) => plain({
  layout: 'horizontal',
  padding: [0, 24],
  h: 60,
  alignItems: 'center',
  justifyContent: 'space_between',
  children: [
    plain({
      layout: 'horizontal',
      gap: 8,
      alignItems: 'center',
      w: 'fit_content',
      children: [
        ...breadcrumb.flatMap((b, i) => [
          i > 0 ? text('›', { size: 14, color: COLORS.textSec }) : null,
          text(b, { size: 13, weight: i === breadcrumb.length - 1 ? 700 : 400, color: i === breadcrumb.length - 1 ? COLORS.text : COLORS.textSec })
        ]).filter(Boolean)
      ]
    }),
    plain({
      layout: 'horizontal',
      gap: 8,
      alignItems: 'center',
      w: 'fit_content',
      children: [
        ...actions,
        sub('Иван П. • Продюсер'),
        placeholder('AV', 32, 32)
      ]
    })
  ]
});

// ==== Обёртка: layout Sidebar + Content ====
const screen = (name, sidebarIdx, content) => ({
  id: id('root'),
  type: 'frame',
  name,
  width: 1280,
  height: 800,
  layout: 'horizontal',
  gap: 0,
  padding: 0,
  fill: [{ type: 'solid', color: COLORS.bg }],
  clipContent: true,
  children: [
    sidebar(sidebarIdx),
    plain({
      w: 'fill_container',
      h: 'fill_container',
      layout: 'vertical',
      gap: 0,
      padding: 0,
      children: content
    })
  ]
});

// === Sidebar для Superadmin ===
const sbSuper = (activeIdx = 0) => ({
  id: id('sb'),
  type: 'frame',
  name: 'Sidebar',
  width: 220,
  height: 'fill_container',
  layout: 'vertical',
  gap: 6,
  padding: 16,
  fill: [{ type: 'solid', color: '#FAFAFC' }],
  stroke: { thickness: 0, fill: [{ type: 'solid', color: COLORS.border }] },
  children: [
    plain({
      layout: 'horizontal',
      gap: 8,
      alignItems: 'center',
      padding: [12, 8],
      children: [
        placeholder('LOGO', 28, 28),
        text('SUPERADMIN', { size: 12, weight: 700 })
      ]
    }),
    divider(),
    sub('УПРАВЛЕНИЕ'),
    ...['Смены', 'Роли и Ачивки', 'Экспорт', 'Статистика']
      .map((l, i) => navItem(l, i === activeIdx)),
    divider(),
    sub('АККАУНТ'),
    navItem('Выход')
  ]
});

const screenSuper = (name, sidebarIdx, content) => ({
  id: id('root'),
  type: 'frame',
  name,
  width: 1280,
  height: 800,
  layout: 'horizontal',
  gap: 0,
  padding: 0,
  fill: [{ type: 'solid', color: COLORS.bg }],
  clipContent: true,
  children: [
    sbSuper(sidebarIdx),
    plain({
      w: 'fill_container',
      h: 'fill_container',
      layout: 'vertical',
      gap: 0,
      padding: 0,
      children: content
    })
  ]
});

const contentWrap = (kids) => plain({
  padding: 24,
  gap: 20,
  children: kids
});

// ==== Генерация экранов ====

// --- A1 Dashboard
const statCard = (label, value, delta) => box({
  w: 'fill_container',
  padding: 20,
  gap: 6,
  children: [
    sub(label.toUpperCase()),
    text(value, { size: 32, weight: 700 }),
    sub(delta)
  ]
});

const A1 = () => screen('A1. Dashboard', 0, [
  header(['Главная', 'Dashboard']),
  contentWrap([
    hdg('Dashboard', 22),
    plain({ layout: 'horizontal', gap: 16, children: [
      statCard('Всего участников', '60', '↑ 2 за день'),
      statCard('Средний баланс', '142', '↑ 18 за день'),
      statCard('Чек-инов сегодня', '174', '97% явка'),
      statCard('Активных событий', '6', '2 завершены')
    ]}),
    plain({ layout: 'horizontal', gap: 16, children: [
      box({ w: 'fill_container', padding: 20, children: [
        hdg('Активность за 7 дней', 15),
        placeholder('[ График активности ]', 'fill_container', 220)
      ]}),
      box({ w: 480, padding: 20, children: [
        hdg('Топ-5 участников', 15),
        ...[['1', 'Анна К.', '320'], ['2', 'Сергей В.', '280'], ['3', 'Иван П. (вы)', '150'], ['4', 'Мария С.', '120'], ['5', 'Алексей Б.', '95']]
          .map(([p, n, b]) => plain({ layout: 'horizontal', gap: 12, alignItems: 'center', padding: [8, 0], children: [
            text(p, { size: 14, weight: 700, width: 20 }),
            text(n, { size: 13, width: 'fill_container' }),
            text(b, { size: 14, weight: 700 })
          ]}))
      ]})
    ]}),
    plain({ layout: 'horizontal', gap: 16, children: [
      box({ w: 'fill_container', padding: 20, children: [
        hdg('События сегодня', 15),
        ...['08:00 Завтрак', '10:00 Мастер-класс: Монтаж', '13:00 Обед', '15:00 Съёмка: Экскурсия', '19:00 Ужин']
          .map(e => plain({ layout: 'horizontal', gap: 12, padding: [8, 0], children: [
            sub(e.slice(0, 5), 13), text(e.slice(6), { size: 13 })
          ]}))
      ]}),
      box({ w: 'fill_container', padding: 20, children: [
        hdg('Последние транзакции', 15),
        ...[['+20', 'Анна К.', '14:32 • Мастер-класс'], ['+15', 'Сергей В.', '14:30 • Мастер-класс'], ['-10', 'Алексей Б.', '13:05 • Опоздание'], ['+10', 'Мария С.', '13:02 • Обед']]
          .map(([s, n, m]) => plain({ layout: 'horizontal', gap: 12, padding: [8, 0], alignItems: 'center', children: [
            text(s, { size: 14, weight: 700, width: 40, color: s.startsWith('-') ? COLORS.danger : COLORS.text }),
            text(n, { size: 13, width: 120 }),
            sub(m, 11)
          ]}))
      ]})
    ]})
  ])
]);

// --- A2 Сканер QR
const A2 = () => screen('A2. Сканер QR', 1, [
  header(['Главная', 'Сканер QR']),
  contentWrap([
    hdg('Сканер QR', 22),
    sub('Событие: ОБЕД 14 ИЮНЯ  •  Чек-инов: 42 из 60'),
    plain({ layout: 'horizontal', gap: 20, children: [
      box({ w: 560, padding: 20, children: [
        hdg('Камера', 15),
        placeholder('[ Live-превью камеры\n+ рамка-прицел ]', 'fill_container', 380),
        plain({ layout: 'horizontal', gap: 12, alignItems: 'center', children: [
          btn('Переключить камеру'),
          btn('Вспышка'),
          plain({ w: 'fill_container' }),
          text('● LIVE', { size: 11, weight: 700, color: COLORS.danger })
        ]})
      ]}),
      box({ w: 'fill_container', padding: 20, children: [
        hdg('Результат сканирования', 15),
        box({ w: 'fill_container', padding: 16, bg: '#FAFAFC', children: [
          plain({ layout: 'horizontal', gap: 12, alignItems: 'center', children: [
            placeholder('AVATAR', 56, 56),
            plain({ w: 'fill_container', gap: 2, children: [
              text('ИВАН ПЕТРОВ', { size: 16, weight: 700 }),
              sub('Отряд: Кобры  •  ID TM-001')
            ]}),
            plain({ gap: 2, alignItems: 'end', children: [
              sub('БАЛАНС', 10),
              text('150', { size: 22, weight: 700 })
            ]})
          ]})
        ]}),
        sub('БЫСТРОЕ НАЧИСЛЕНИЕ'),
        plain({ layout: 'horizontal', gap: 8, children: [
          btn('+10'), btn('+15'), btn('+20'), btn('+25')
        ]}),
        sub('СВОБОДНАЯ СУММА'),
        plain({ layout: 'horizontal', gap: 8, children: [
          input('Введите сумму'),
          input('Причина начисления')
        ]}),
        divider(),
        sub('ДЕЙСТВИЕ'),
        plain({ layout: 'horizontal', gap: 8, children: [
          btn('ЧЕК-ИН', { primary: true, w: 'fill_container', h: 44 }),
          btn('-10 ШТРАФ', { w: 'fill_container', h: 44 })
        ]})
      ]})
    ]})
  ])
]);

// --- A3 Участники
const A3 = () => screen('A3. Участники', 2, [
  header(['Главная', 'Участники']),
  contentWrap([
    plain({ layout: 'horizontal', alignItems: 'center', justifyContent: 'space_between', children: [
      hdg('Участники (60)', 22),
      plain({ layout: 'horizontal', gap: 8, w: 'fit_content', children: [
        btn('Экспорт CSV'), btn('+ Добавить', { primary: true })
      ]})
    ]}),
    box({ padding: 16, children: [
      plain({ layout: 'horizontal', gap: 12, children: [
        input('Поиск по имени / телефону'),
        input('Фильтр: все отряды'),
        input('Сортировка: по балансу ↓')
      ]}),
      divider(),
      plain({ layout: 'horizontal', padding: [8, 12], children: [
        sub('#', 11), text('', { width: 20 }),
        sub('АВАТАР', 11), text('', { width: 80 }),
        sub('ИМЯ', 11), text('', { width: 220 }),
        sub('ОТРЯД', 11), text('', { width: 120 }),
        sub('БАЛАНС', 11), text('', { width: 80 }),
        sub('АЧИВОК', 11), text('', { width: 80 }),
        sub('ДЕЙСТВИЯ', 11)
      ]}),
      divider(),
      ...[['1', 'Анна Козлова', 'Кобры', '320', '3/6'], ['2', 'Сергей Волков', 'Акулы', '280', '2/6'], ['3', 'Иван Петров', 'Кобры', '150', '1/6'], ['4', 'Мария Смирнова', 'Акулы', '120', '1/6'], ['5', 'Алексей Белов', 'Кобры', '95', '0/6']]
        .map(([n, name, sq, bal, ach]) => plain({ layout: 'horizontal', padding: [12, 12], alignItems: 'center', children: [
          text(n, { size: 13, width: 20 }),
          placeholder('AV', 32, 32), text('', { width: 48 }),
          text(name, { size: 13, width: 220 }),
          text(sq, { size: 13, width: 120 }),
          text(bal, { size: 13, weight: 700, width: 80 }),
          text(ach, { size: 13, width: 80 }),
          btn('Открыть', { h: 28 })
        ]}))
    ]})
  ])
]);

// --- A4 Карточка участника
const A4 = () => screen('A4. Карточка участника', 2, [
  header(['Главная', 'Участники', 'Иван Петров']),
  contentWrap([
    plain({ layout: 'horizontal', gap: 20, children: [
      box({ w: 400, padding: 20, children: [
        plain({ alignItems: 'center', gap: 12, children: [
          placeholder('PHOTO', 120, 120),
          hdg('ИВАН ПЕТРОВ', 18),
          sub('@ivan_petrov  •  Отряд Кобры')
        ]}),
        divider(),
        hdg('Анкета', 14),
        ...[['Имя', 'Иван'], ['Фамилия', 'Петров'], ['Телефон', '+7 (985) 123-45-67'], ['Дата рождения', '12.08.2006'], ['Instagram', '@ivan_petrov'], ['TikTok', '—'], ['Likee', '—']]
          .map(([k, v]) => plain({ layout: 'horizontal', justifyContent: 'space_between', padding: [6, 0], children: [
            sub(k, 12), text(v, { size: 12, weight: 500 })
          ]})),
        divider(),
        plain({ layout: 'horizontal', gap: 8, children: [
          btn('Редактировать', { w: 'fill_container' }),
          btn('Уведомить', { w: 'fill_container' })
        ]})
      ]}),
      plain({ w: 'fill_container', gap: 20, children: [
        box({ padding: 20, children: [
          plain({ layout: 'horizontal', justifyContent: 'space_between', alignItems: 'center', children: [
            hdg('Баланс', 15),
            text('150', { size: 36, weight: 700 })
          ]}),
          sub('Ручная правка баланса (доступно суперадмину)'),
          plain({ layout: 'horizontal', gap: 8, children: [
            input('Сумма'), input('Причина'), btn('Применить', { primary: true })
          ]})
        ]}),
        box({ padding: 20, children: [
          hdg('Ачивки (1/6)', 15),
          plain({ layout: 'horizontal', gap: 10, children: [
            placeholder('🌟 НОВИЧОК', 120, 80),
            placeholder('🔒 Активист\n200 XP', 120, 80),
            placeholder('🔒 Профи\n300 XP', 120, 80),
            placeholder('🔒 Мастер', 120, 80),
            placeholder('🔒 Легенда', 120, 80)
          ]})
        ]}),
        box({ padding: 20, children: [
          hdg('История транзакций', 15),
          ...[['+20', '14 июня 14:32', 'Мастер-класс: Монтаж', 'Продюсер А.'], ['+15', '14 июня 13:00', 'Чек-ин: Обед', 'Продюсер А.'], ['+10', '13 июня 19:05', 'Чек-ин: Ужин', 'Продюсер Б.'], ['-10', '13 июня 13:15', 'Опоздание', 'Продюсер А.'], ['+100', '12 июня 18:00', 'Регистрация', 'Система']]
            .map(([s, d, r, a]) => plain({ layout: 'horizontal', padding: [8, 0], gap: 12, alignItems: 'center', children: [
              text(s, { size: 13, weight: 700, width: 50, color: s.startsWith('-') ? COLORS.danger : COLORS.text }),
              sub(d, 11), text('', { width: 16 }),
              text(r, { size: 12, width: 'fill_container' }),
              sub(a, 11)
            ]}))
        ]})
      ]})
    ]})
  ])
]);

// --- A5 События
const A5 = () => screen('A5. События', 3, [
  header(['Главная', 'События']),
  contentWrap([
    plain({ layout: 'horizontal', justifyContent: 'space_between', alignItems: 'center', children: [
      hdg('События', 22),
      btn('+ Создать событие', { primary: true })
    ]}),
    box({ padding: 16, children: [
      plain({ layout: 'horizontal', gap: 12, children: [
        input('Фильтр по дате'),
        input('Тип: все'),
        input('Статус: все')
      ]}),
      divider(),
      plain({ layout: 'horizontal', padding: [8, 12], children: [
        sub('ДАТА', 11), text('', { width: 100 }),
        sub('ВРЕМЯ', 11), text('', { width: 80 }),
        sub('НАЗВАНИЕ', 11), text('', { width: 280 }),
        sub('ТИП', 11), text('', { width: 100 }),
        sub('XP', 11), text('', { width: 60 }),
        sub('ЧЕК-ИНЫ', 11), text('', { width: 100 }),
        sub('ДЕЙСТВИЯ', 11)
      ]}),
      divider(),
      ...[['14 июня', '08:00', 'Завтрак', 'Питание', '5', '58/60'], ['14 июня', '10:00', 'Мастер-класс: Монтаж', 'Активность', '20', '42/60'], ['14 июня', '13:00', 'Обед', 'Питание', '5', '42/60'], ['14 июня', '15:00', 'Съёмка: Экскурсия', 'Активность', '20', '—'], ['14 июня', '19:00', 'Ужин', 'Питание', '5', '—']]
        .map(([d, t, n, ty, xp, ci]) => plain({ layout: 'horizontal', padding: [12, 12], alignItems: 'center', children: [
          text(d, { size: 13, width: 100 }),
          text(t, { size: 13, weight: 700, width: 80 }),
          text(n, { size: 13, width: 280 }),
          text(ty, { size: 13, width: 100 }),
          text(xp, { size: 13, width: 60 }),
          text(ci, { size: 13, width: 100 }),
          btn('Открыть', { h: 28 })
        ]}))
    ]})
  ])
]);

// --- A6 Редактор события
const A6 = () => screen('A6. Редактор события', 3, [
  header(['Главная', 'События', 'Новое событие']),
  contentWrap([
    hdg('Новое событие', 22),
    plain({ layout: 'horizontal', gap: 20, children: [
      box({ w: 'fill_container', padding: 24, children: [
        hdg('Основное', 15),
        plain({ gap: 6, children: [sub('НАЗВАНИЕ'), input('Например: Мастер-класс по монтажу')]}),
        plain({ layout: 'horizontal', gap: 12, children: [
          plain({ w: 'fill_container', gap: 6, children: [sub('ТИП'), input('Активность')]}),
          plain({ w: 'fill_container', gap: 6, children: [sub('ДАТА'), input('14.06.2026')]})
        ]}),
        plain({ layout: 'horizontal', gap: 12, children: [
          plain({ w: 'fill_container', gap: 6, children: [sub('ВРЕМЯ НАЧАЛА'), input('10:00')]}),
          plain({ w: 'fill_container', gap: 6, children: [sub('ВРЕМЯ ОКОНЧАНИЯ'), input('12:00')]})
        ]}),
        plain({ gap: 6, children: [sub('ОПИСАНИЕ'), box({ padding: 12, h: 100, children: [text('Описание события...', { color: COLORS.placeholder })]})]}),
        divider(),
        hdg('Геймификация', 15),
        plain({ layout: 'horizontal', gap: 12, children: [
          plain({ w: 'fill_container', gap: 6, children: [sub('XP ЗА ЧЕК-ИН'), input('20')]}),
          plain({ w: 'fill_container', gap: 6, children: [sub('ЛИМИТ ЧЕК-ИНОВ'), input('1')]})
        ]}),
        divider(),
        plain({ layout: 'horizontal', gap: 8, justifyContent: 'end', children: [
          btn('Отмена'),
          btn('Сохранить черновик'),
          btn('Опубликовать', { primary: true })
        ]})
      ]}),
      box({ w: 360, padding: 20, children: [
        hdg('Предпросмотр', 15),
        placeholder('[ Карточка события\nв плане дня ]', 'fill_container', 180),
        divider(),
        hdg('Дополнительно', 13),
        plain({ gap: 6, children: [
          sub('☐ Обязательное событие'),
          sub('☐ Только для выбранного отряда'),
          sub('☐ Рассылка уведомления за час'),
          sub('☐ Повтор ежедневно')
        ]})
      ]})
    ]})
  ])
]);

// --- A7 Уведомления
const A7 = () => screen('A7. Уведомления', 4, [
  header(['Главная', 'Уведомления']),
  contentWrap([
    hdg('Уведомления', 22),
    plain({ layout: 'horizontal', gap: 20, children: [
      box({ w: 540, padding: 24, children: [
        hdg('Новое уведомление', 15),
        plain({ gap: 6, children: [
          sub('АУДИТОРИЯ'),
          plain({ gap: 6, children: [
            plain({ layout: 'horizontal', gap: 8, children: [text('◉', { size: 14 }), text('Всему отряду (Кобры)', { size: 13 })]}),
            plain({ layout: 'horizontal', gap: 8, children: [text('○', { size: 14 }), text('Всем участникам смены', { size: 13 })]}),
            plain({ layout: 'horizontal', gap: 8, children: [text('○', { size: 14 }), text('Конкретному участнику', { size: 13 })]})
          ]})
        ]}),
        plain({ gap: 6, children: [sub('ТЕКСТ СООБЩЕНИЯ'), box({ padding: 12, h: 140, children: [text('Текст отправится в Telegram всем адресатам...', { color: COLORS.placeholder })]})]}),
        plain({ layout: 'horizontal', gap: 12, alignItems: 'center', children: [
          sub('0 / 4096 символов'),
          plain({ w: 'fill_container' }),
          btn('Предпросмотр'),
          btn('Отправить', { primary: true })
        ]})
      ]}),
      box({ w: 'fill_container', padding: 20, children: [
        hdg('Лог уведомлений', 15),
        plain({ layout: 'horizontal', padding: [8, 0], children: [
          sub('ВРЕМЯ', 11), text('', { width: 130 }),
          sub('АУДИТОРИЯ', 11), text('', { width: 150 }),
          sub('ТЕКСТ', 11), text('', { width: 'fill_container' }),
          sub('АВТОР', 11)
        ]}),
        divider(),
        ...[['14.06 09:00', 'Все', 'Доброе утро! План дня...', 'Бот'], ['13.06 21:30', 'Кобры', 'Встречаемся в лобби в 08:00', 'Иван П.'], ['13.06 18:00', 'Конкретный', 'Отличная работа сегодня!', 'Иван П.']]
          .map(([tm, au, msg, by]) => plain({ layout: 'horizontal', padding: [10, 0], children: [
            text(tm, { size: 12, width: 130 }),
            text(au, { size: 12, width: 150 }),
            text(msg, { size: 12, width: 'fill_container' }),
            sub(by, 11)
          ]}))
      ]})
    ]})
  ])
]);

// --- A8 План дня
const A8 = () => screen('A8. План дня', 5, [
  header(['Главная', 'План дня']),
  contentWrap([
    plain({ layout: 'horizontal', justifyContent: 'space_between', alignItems: 'center', children: [
      hdg('План дня', 22),
      plain({ layout: 'horizontal', gap: 8, w: 'fit_content', children: [
        btn('← 13 июня'), btn('14 июня', { primary: true }), btn('15 июня →'),
        plain({ w: 20 }),
        btn('Отправить в общий чат', { primary: true })
      ]})
    ]}),
    plain({ layout: 'horizontal', gap: 20, children: [
      box({ w: 'fill_container', padding: 20, children: [
        hdg('Timeline — 14 июня', 15),
        ...[['08:00', '09:00', 'Завтрак'], ['10:00', '12:00', 'Мастер-класс: Монтаж'], ['13:00', '14:00', 'Обед'], ['15:00', '18:00', 'Съёмка: Экскурсия'], ['19:00', '20:00', 'Ужин'], ['21:00', '22:30', 'Вечерний показ']]
          .map(([s, e, n]) => plain({ layout: 'horizontal', gap: 12, padding: [10, 12], alignItems: 'center', children: [
            text('⋮⋮', { size: 14, color: COLORS.placeholder, width: 16 }),
            text(`${s}–${e}`, { size: 13, weight: 700, width: 110 }),
            text(n, { size: 13, width: 'fill_container' }),
            btn('✎', { h: 28 }),
            btn('×', { h: 28 })
          ]})),
        divider(),
        btn('+ Добавить активность', { w: 'fill_container' })
      ]}),
      box({ w: 340, padding: 20, children: [
        hdg('Настройки рассылки', 15),
        plain({ gap: 6, children: [sub('ВРЕМЯ ОТПРАВКИ'), input('08:00')]}),
        plain({ gap: 6, children: [sub('ПОЛУЧАТЕЛИ'), input('Общий чат + ЛС всем')]}),
        plain({ gap: 6, children: [sub('ШАБЛОН'), input('Стандартный')]}),
        divider(),
        hdg('Статус', 13),
        sub('✓ Автоотправка включена'),
        sub('Последняя отправка: 13.06 08:00'),
        sub('Следующая: 14.06 08:00')
      ]})
    ]})
  ])
]);

// --- A9 Superadmin: Смены
const A9 = () => screenSuper('A9. Superadmin: Смены', 0, [
  header(['Superadmin', 'Смены']),
  contentWrap([
    plain({ layout: 'horizontal', justifyContent: 'space_between', alignItems: 'center', children: [
      hdg('Все смены', 22),
      btn('+ Новая смена', { primary: true })
    ]}),
    box({ padding: 16, children: [
      plain({ layout: 'horizontal', padding: [8, 12], children: [
        sub('НАЗВАНИЕ', 11), text('', { width: 320 }),
        sub('ДАТЫ', 11), text('', { width: 200 }),
        sub('УЧАСТНИКОВ', 11), text('', { width: 120 }),
        sub('СТАТУС', 11), text('', { width: 120 }),
        sub('ДЕЙСТВИЯ', 11)
      ]}),
      divider(),
      ...[['ТЕЛЕМОРЕ Лето 2026', '10.06 – 23.06', '60', 'Активна'], ['ТЕЛЕМОРЕ Зима 2025', '05.12 – 18.12', '45', 'Завершена'], ['ТЕЛЕМОРЕ Осень 2025', '15.09 – 28.09', '55', 'Завершена']]
        .map(([n, d, p, s]) => plain({ layout: 'horizontal', padding: [12, 12], alignItems: 'center', children: [
          text(n, { size: 13, weight: 600, width: 320 }),
          text(d, { size: 13, width: 200 }),
          text(p, { size: 13, width: 120 }),
          text(s, { size: 13, width: 120 }),
          plain({ layout: 'horizontal', gap: 6, w: 'fit_content', children: [
            btn('Открыть', { h: 28 }), btn('Копировать', { h: 28 }), btn('Архив', { h: 28 })
          ]})
        ]}))
    ]}),
    box({ padding: 20, children: [
      hdg('Создать новую смену', 15),
      plain({ layout: 'horizontal', gap: 12, children: [
        box({ w: 'fill_container', padding: 16, bg: '#FAFAFC', children: [
          text('◉ С нуля', { size: 13, weight: 700 }),
          sub('Пустая смена с настройками по умолчанию')
        ]}),
        box({ w: 'fill_container', padding: 16, bg: '#FAFAFC', children: [
          text('○ Копировать существующую', { size: 13, weight: 700 }),
          sub('Настройки, ачивки, шаблоны событий — без участников')
        ]})
      ]}),
      plain({ gap: 6, children: [sub('НАЗВАНИЕ'), input('Например: ТЕЛЕМОРЕ Лето 2027')]}),
      plain({ layout: 'horizontal', gap: 12, children: [
        plain({ w: 'fill_container', gap: 6, children: [sub('ДАТА НАЧАЛА'), input('10.06.2027')]}),
        plain({ w: 'fill_container', gap: 6, children: [sub('ДАТА ОКОНЧАНИЯ'), input('23.06.2027')]}),
        plain({ w: 'fill_container', gap: 6, children: [sub('УЧАСТНИКОВ (MAX)'), input('60')]})
      ]}),
      plain({ layout: 'horizontal', gap: 8, justifyContent: 'end', children: [
        btn('Отмена'), btn('Создать', { primary: true })
      ]})
    ]})
  ])
]);

// --- A10 Superadmin: Роли и Ачивки
const A10 = () => screenSuper('A10. Роли и Ачивки', 1, [
  header(['Superadmin', 'Роли и Ачивки']),
  contentWrap([
    hdg('Роли и Ачивки', 22),
    plain({ layout: 'horizontal', gap: 20, children: [
      box({ w: 'fill_container', padding: 20, children: [
        hdg('Управление ролями', 15),
        plain({ layout: 'horizontal', gap: 8, children: [input('Поиск пользователя'), btn('+ Назначить роль', { primary: true })]}),
        divider(),
        plain({ layout: 'horizontal', padding: [8, 0], children: [
          sub('ПОЛЬЗОВАТЕЛЬ', 11), text('', { width: 240 }),
          sub('РОЛЬ', 11), text('', { width: 140 }),
          sub('ОТРЯД', 11), text('', { width: 120 }),
          sub('', 11)
        ]}),
        divider(),
        ...[['Иван Петров', 'Продюсер', 'Кобры'], ['Мария Смирнова', 'Продюсер', 'Акулы'], ['Администратор', 'Суперадмин', '—'], ['Анна Козлова', 'Участник', 'Кобры']]
          .map(([u, r, sq]) => plain({ layout: 'horizontal', padding: [10, 0], alignItems: 'center', children: [
            text(u, { size: 13, width: 240 }),
            text(r, { size: 13, weight: 600, width: 140 }),
            text(sq, { size: 13, width: 120 }),
            btn('Изменить', { h: 28 })
          ]}))
      ]}),
      plain({ w: 420, gap: 20, children: [
        box({ padding: 20, children: [
          hdg('Ачивки (пороги XP)', 15),
          ...[['🌟 Новичок', '100'], ['🔥 Активист', '200'], ['💎 Профи', '300'], ['🏆 Мастер', '400'], ['👑 Легенда', '500'], ['😎 Босс', '600']]
            .map(([n, p]) => plain({ layout: 'horizontal', padding: [8, 0], alignItems: 'center', children: [
              text(n, { size: 13, width: 'fill_container' }),
              text(`${p} XP`, { size: 13, weight: 700, width: 70 }),
              btn('✎', { h: 28 })
            ]})),
          divider(),
          btn('+ Добавить ачивку', { w: 'fill_container' })
        ]}),
        box({ padding: 20, children: [
          hdg('Экспорт в Google Sheets', 15),
          plain({ gap: 6, children: [sub('ID ТАБЛИЦЫ'), input('1AbC...xyz')]}),
          plain({ gap: 6, children: [sub('ЛИСТ'), input('Участники_2026')]}),
          plain({ layout: 'horizontal', gap: 8, children: [
            btn('Проверить связь'),
            btn('Выгрузить сейчас', { primary: true })
          ]}),
          sub('Последняя выгрузка: 14.06 09:30')
        ]})
      ]})
    ]})
  ])
]);

// ==== Сохранение ====
const OUT = {
  'A1.json': A1(), 'A2.json': A2(), 'A3.json': A3(),  'A4.json': A4(),
  'A5.json': A5(), 'A6.json': A6(), 'A7.json': A7(),  'A8.json': A8(),
  'A9.json': A9(), 'A10.json': A10()
};

const dir = __dirname;
for (const [name, data] of Object.entries(OUT)) {
  fs.writeFileSync(`${dir}/${name}`, JSON.stringify(data, null, 2));
  console.log(`Written: ${name} (${JSON.stringify(data).length} bytes)`);
}
