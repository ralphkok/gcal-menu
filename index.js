const path = require('path');
const { menubar } = require('menubar');

const getTodaysIcon = (appPath) => path.resolve(
  appPath,
  '..',
  `icons/tray/icon_${(new Date().getDate()).toString().padStart(2, '0')}.png`
);

const setIcon = (tray, appPath) => {
  tray.setImage(getTodaysIcon(appPath));
}

const mb = menubar({
  dir: path.resolve(__dirname),
  index: `https://google.com/calendar`,
  browserWindow: {
    width: 600,
    height: 800
  }
});

mb.on('ready', () => {
  setIcon(mb.tray, mb.app.getAppPath());
  setInterval(() => {
    setIcon(mb.tray, mb.app.getAppPath());
  }, 10000);
});
