// Light is the default for everyone (the OS setting is ignored). A visitor's choice is
// remembered in localStorage under THEME_KEY, shared with the static /development pages.
export const THEME_KEY = 'vivatheca-theme';
export const themeInitScript = `try{if(localStorage.getItem('${THEME_KEY}')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`;
