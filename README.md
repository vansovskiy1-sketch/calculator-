# Dota 2 Boost Calculator v2

Статический калькулятор для GitHub Pages.

## Файлы
- `index.html` — интерфейс
- `style.css` — дизайн и адаптивность
- `app.js` — услуги, расчёты и Telegram/share
- `pricing.js` — логика доплат
- `tests/pricing.test.js` — проверки тарифной логики

## GitHub Pages
Загрузите файлы в корень репозитория. В Settings → Pages выберите `Deploy from a branch`, ветку `main` и папку `/ (root)`.

## Telegram
Кнопка заказа использует Telegram Share, поэтому никакой username администратора в коде не требуется. Пользователь сможет выбрать чат и отправить сформированный расчёт.

## v2.1 input UX
- Numeric fields use mobile-friendly numeric keyboards.
- Custom − / + steppers make MMR, wins, hours, behavior score and other values easier to edit.
- MMR changes no longer rebuild the form on every keystroke, so cursor/focus stays stable while typing.
