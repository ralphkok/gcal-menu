const path = require('path');
const { menubar } = require('menubar');
const { BrowserWindow } = require('electron');

const commandLineArgs = require('command-line-args');
const args = commandLineArgs([
  { name: 'debug', alias: 'd', type: Boolean }
]);

/**
 * Get icon path based on day of the month.
 * @param {string} appPath 
 */
const getTodaysIcon = (appPath) => args.debug
  ? path.resolve(
      `icons/tray/icon_${(new Date().getDate()).toString().padStart(2, '0')}.png`
    )
  : path.resolve(
      appPath,
      '..',
      `icons/tray/icon_${(new Date().getDate()).toString().padStart(2, '0')}.png`
    );

/**
 * Update the tray icon.
 * @param {Tray} tray 
 * @param {string} appPath 
 */
const setIcon = (tray, appPath) => {
  tray.setImage(getTodaysIcon(appPath));
}

/**
 * Open new windows in a separate, movable, closable window.
 * @param {*} event 
 * @param {*} url 
 * @param {*} frameName 
 * @param {*} disposition 
 * @param {*} options 
 * @param {*} additionalFeatures 
 * @param {*} referrer 
 * @param {*} postBody 
 */
const onNewWindow = (event, url, frameName, disposition, options, additionalFeatures, referrer, postBody) => {
  event.preventDefault();
  const win = new BrowserWindow({
    webContents: options.webContents, // use existing webContents if provided
    show: false,
    autoHideMenuBar: false,
    movable: true,
    resizable: true,
    focusable: true,
    closable: true,
  });
  win.once('ready-to-show', () => win.show());
  if (!options.webContents) {
    const loadOptions = {
      httpReferrer: referrer
    };
    if (postBody != null) {
      const { data, contentType, boundary } = postBody;
      loadOptions.postData = postBody.data;
      loadOptions.extraHeaders = `content-type: ${contentType}; boundary=${boundary}`;
    }

    win.loadURL(url, loadOptions); // existing webContents will be navigated automatically
  }
  event.newGuest = win;
};

/**
 * Create the main menubar application.
 */
const mb = menubar({
  dir: path.resolve(__dirname),
  index: `https://google.com/calendar`,
  browserWindow: {
    width: 600,
    height: 800,
    movable: true,
    resizable: true,
    focusable: true
  }
});

/**
 * Update the tray when the app is ready.
 */
mb.on('ready', () => {
  // Set the tray icon using today's date
  setIcon(mb.tray, mb.app.getAppPath());
  // Check every 30s to see if tray icon needs updating to today's date
  setInterval(() => {
    setIcon(mb.tray, mb.app.getAppPath());
  }, 30000);
});

/**
 * Listen for new windows being opened.
 */
mb.on('after-create-window', () => {
  mb.window.webContents.on('new-window', onNewWindow);
});
